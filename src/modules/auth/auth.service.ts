import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { addMilliseconds } from 'date-fns';
import { UserStatus, VerificationCodeType } from 'generated/prisma/client';
import ms, { StringValue } from 'ms';
import { generateSecret, generateURI, verify } from 'otplib';
import QRCode from 'qrcode';
import env from 'src/config/env.config';
import {
  isPrismaErrorCode,
  PrismaErrorCode,
} from 'src/database/prisma-error.util';
import { HashingService } from 'src/shared/hashings/hashing.service';
import { generateOtpCode } from 'src/shared/helpers';
import { JwtTokenService } from 'src/shared/jwt/jwt-token.service';
import { AuthRepository } from './auth.repo';
import {
  AuthTokens,
  Disable2FaBody,
  ForgotPasswordBody,
  LoginBody,
  RefreshTokenBody,
  RegisterBody,
  SendOtpBody,
} from './entities/auth.model';
import { RoleService } from './role.service';

type RequestDeviceInfo = {
  userAgent: string;
  ip: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly roleService: RoleService,
    private readonly jwtTokenService: JwtTokenService,
    private readonly authRepository: AuthRepository,
  ) {}

  async sendOtp(body: SendOtpBody) {
    const code = generateOtpCode();
    const otpExpiresInMs = ms(env.OTP_EXPIRES_IN as StringValue);

    if (typeof otpExpiresInMs !== 'number') {
      throw new InternalServerErrorException('Invalid OTP expiration config');
    }

    const expiresAt = addMilliseconds(new Date(), otpExpiresInMs);

    await this.authRepository.upsertVerificationCode({
      email: body.email,
      type: body.type,
      code,
      expiresAt,
    });

    return {
      message: 'OTP code sent successfully',
    };
  }

  async register(body: RegisterBody) {
    try {
      const verificationCode =
        await this.authRepository.findValidVerificationCode({
          email: body.email,
          code: body.code,
          type: VerificationCodeType.REGISTER,
        });

      if (!verificationCode) {
        throw new BadRequestException('Invalid or expired OTP code');
      }

      const hashedPassword = await this.hashingService.hash(body.password);
      const roleId = await this.roleService.getClientId();

      const user = await this.authRepository.createUser(
        body,
        hashedPassword,
        roleId,
      );

      await this.authRepository.deleteVerificationCode({
        email: body.email,
        type: VerificationCodeType.REGISTER,
      });

      return user;
    } catch (error) {
      if (isPrismaErrorCode(error, PrismaErrorCode.UniqueConstraintFailed)) {
        throw new ConflictException('Email already exists');
      }

      throw error;
    }
  }

  async enable2Fa(userId: number) {
    const user = await this.authRepository.findUserById(userId);

    if (!user) {
      throw new UnauthorizedException('Invalid user');
    }

    if (user.totpSecret) {
      throw new BadRequestException('2FA is already enabled');
    }

    const secret = generateSecret();
    const otpAuthUrl = generateURI({
      issuer: 'Ecom NestJS',
      label: user.email,
      secret,
    });
    const qrCodeUrl = await QRCode.toDataURL(otpAuthUrl);

    await this.authRepository.updateUserTotpSecret({
      userId: user.id,
      totpSecret: secret,
    });

    return {
      secret,
      otpAuthUrl,
      qrCodeUrl,
    };
  }

  async disable2Fa(userId: number, body: Disable2FaBody) {
    const user = await this.authRepository.findUserById(userId);

    if (!user) {
      throw new UnauthorizedException('Invalid user');
    }

    if (!user.totpSecret) {
      throw new BadRequestException('2FA is not enabled');
    }

    const verifyResult = await verify({
      token: body.code,
      secret: user.totpSecret,
    });

    if (!verifyResult.valid) {
      throw new UnauthorizedException('Invalid 2FA code');
    }

    await this.authRepository.updateUserTotpSecret({
      userId: user.id,
      totpSecret: null,
    });

    return {
      message: '2FA disabled successfully',
    };
  }
  async forgotPassword(body: ForgotPasswordBody) {
    const verificationCode =
      await this.authRepository.findValidVerificationCode({
        email: body.email,
        code: body.code,
        type: VerificationCodeType.FORGOT_PASSWORD,
      });

    if (!verificationCode) {
      throw new BadRequestException('Invalid or expired OTP code');
    }

    const user = await this.authRepository.findUserByEmail(body.email);

    if (!user) {
      throw new BadRequestException('Invalid or expired OTP code');
    }

    const hashedPassword = await this.hashingService.hash(body.newPassword);

    await this.authRepository.updateUserPassword({
      userId: user.id,
      hashedPassword,
    });

    await this.authRepository.deleteVerificationCode({
      email: body.email,
      type: VerificationCodeType.FORGOT_PASSWORD,
    });

    await this.authRepository.deleteRefreshTokensByUserId(user.id);
    await this.authRepository.deactivateDevicesByUserId(user.id);

    return {
      message: 'Password reset successfully',
    };
  }
  async login(body: LoginBody, deviceInfo: RequestDeviceInfo) {
    const user = await this.authRepository.findUserByEmail(body.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordMatched = await this.hashingService.compare(
      body.password,
      user.password,
    );

    if (!isPasswordMatched) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException('User is not active');
    }

    if (user.totpSecret) {
      if (!body.code) {
        throw new UnauthorizedException('2FA code is required');
      }

      const verifyResult = await verify({
        token: body.code,
        secret: user.totpSecret,
      });

      if (!verifyResult.valid) {
        throw new UnauthorizedException('Invalid 2FA code');
      }
    }
    const device = await this.authRepository.createDevice({
      userId: user.id,
      userAgent: deviceInfo.userAgent,
      ip: deviceInfo.ip,
    });

    const tokens = await this.generateTokens({
      userId: user.id,
      roleId: user.roleId,
      deviceId: device.id,
    });

    const { password, totpSecret, ...safeUser } = user;

    return {
      ...tokens,
      user: safeUser,
    };
  }

  async logout(body: RefreshTokenBody) {
    try {
      await this.jwtTokenService.verifyRefreshToken(body.refreshToken);

      const deletedRefreshToken = await this.authRepository.deleteRefreshToken(
        body.refreshToken,
      );

      await this.authRepository.deactivateDevice(deletedRefreshToken.deviceId);

      return {
        message: 'Logout successfully',
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getActiveDevices(userId: number, currentDeviceId: number) {
    const devices = await this.authRepository.findActiveDevicesByUserId(userId);

    return devices.map((device) => ({
      ...device,
      isCurrent: device.id === currentDeviceId,
    }));
  }

  async logoutDevice(userId: number, deviceId: number) {
    const loggedOut = await this.authRepository.logoutDevice(userId, deviceId);

    if (!loggedOut) {
      throw new ForbiddenException(
        'Device does not belong to this user or is already logged out',
      );
    }

    return {
      message: 'Device logged out successfully',
    };
  }

  async logoutOtherDevices(userId: number, currentDeviceId: number) {
    await this.authRepository.logoutOtherDevices(userId, currentDeviceId);

    return {
      message: 'Other devices logged out successfully',
    };
  }
  async refreshToken(
    body: RefreshTokenBody,
    deviceInfo: RequestDeviceInfo,
  ): Promise<AuthTokens> {
    try {
      const payload = await this.jwtTokenService.verifyRefreshToken(
        body.refreshToken,
      );

      const deletedRefreshToken = await this.authRepository.deleteRefreshToken(
        body.refreshToken,
      );

      await this.authRepository.updateDeviceActivity({
        id: deletedRefreshToken.deviceId,
        userAgent: deviceInfo.userAgent,
        ip: deviceInfo.ip,
        isActive: true,
      });

      const user = await this.authRepository.findUserById(payload.sub);

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateTokens({
        userId: user.id,
        roleId: user.roleId,
        deviceId: deletedRefreshToken.deviceId,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async generateTokens(data: {
    userId: number;
    roleId: number;
    deviceId: number;
  }): Promise<AuthTokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtTokenService.signAccessToken({
        sub: data.userId,
        roleId: data.roleId,
        deviceId: data.deviceId,
        jti: randomUUID(),
      }),
      this.jwtTokenService.signRefreshToken({
        sub: data.userId,
        jti: randomUUID(),
      }),
    ]);

    const refreshTokenPayload =
      await this.jwtTokenService.verifyRefreshToken(refreshToken);

    if (!refreshTokenPayload.exp) {
      throw new InternalServerErrorException(
        'Refresh token expiration is missing',
      );
    }

    await this.authRepository.createRefreshToken({
      token: refreshToken,
      userId: data.userId,
      deviceId: data.deviceId,
      expiresAt: new Date(refreshTokenPayload.exp * 1000),
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
