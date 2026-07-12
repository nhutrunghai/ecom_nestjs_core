import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserStatus } from 'generated/prisma/client';
import {
  isPrismaErrorCode,
  PrismaErrorCode,
} from 'src/database/prisma-error.util';
import { HashingService } from 'src/shared/hashing/hashing.service';
import { JwtTokenService } from 'src/shared/jwt/jwt-token.service';
import { AuthRepository } from './auth.repo';
import {
  AuthTokens,
  LoginBody,
  RefreshTokenBody,
  RegisterBody,
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

  async register(body: RegisterBody) {
    try {
      const hashedPassword = await this.hashingService.hash(body.password);
      const roleId = await this.roleService.getClientId();

      return this.authRepository.createUser(body, hashedPassword, roleId);
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
