import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { addMilliseconds } from 'date-fns';
import { UserStatus, VerificationCodeType } from 'generated/prisma/client';
import ms, { StringValue } from 'ms';
import env from 'src/config/env.config';
import {
  isPrismaErrorCode,
  PrismaErrorCode,
} from 'src/database/prisma-error.util';
import { HashingService } from 'src/shared/hashing/hashing.service';
import { generateOtpCode } from 'src/shared/helpers';
import { JwtTokenService } from 'src/shared/jwt/jwt-token.service';
import { AuthRepository } from './auth.repo';
import {
  AuthTokens,
  LoginBody,
  RefreshTokenBody,
  RegisterBody,
  SendOtpBody,
} from './entities/auth.model';
import { RoleService } from './role.service';

const DEFAULT_DEVICE_ID = 2;

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

  async login(body: LoginBody) {
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

    const tokens = await this.generateTokens(user.id);
    const { password, totpSecret, ...safeUser } = user;

    return {
      ...tokens,
      user: safeUser,
    };
  }

  async refreshToken(body: RefreshTokenBody): Promise<AuthTokens> {
    try {
      const payload = await this.jwtTokenService.verifyRefreshToken(
        body.refreshToken,
      );

      await this.authRepository.deleteRefreshToken(body.refreshToken);

      return this.generateTokens(payload.sub);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async generateTokens(userId: number): Promise<AuthTokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtTokenService.signAccessToken({
        sub: userId,
      }),
      this.jwtTokenService.signRefreshToken({
        sub: userId,
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
      userId,
      deviceId: DEFAULT_DEVICE_ID,
      expiresAt: new Date(refreshTokenPayload.exp * 1000),
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
