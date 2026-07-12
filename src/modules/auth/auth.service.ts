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
import { PrismaService } from 'src/database/prisma.service';
import { HashingService } from 'src/shared/hashing/hashing.service';
import { JwtTokenService } from 'src/shared/jwt/jwt-token.service';
import { LoginBody, RefreshTokenBody, RegisterBody } from './auth.dto';
import { RoleService } from './role.service';

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

const DEFAULT_DEVICE_ID = 2;

const userResponseSelect = {
  id: true,
  email: true,
  name: true,
  phoneNumber: true,
  avatar: true,
  status: true,
  roleId: true,
  createdById: true,
  updatedById: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly prismaService: PrismaService,
    private readonly roleService: RoleService,
    private readonly jwtTokenService: JwtTokenService,
  ) {}

  async register(body: RegisterBody) {
    try {
      const hashedPassword = await this.hashingService.hash(body.password);
      const roleID = await this.roleService.getClientId();

      const user = await this.prismaService.user.create({
        data: {
          email: body.email,
          password: hashedPassword,
          name: body.name,
          phoneNumber: body.phoneNumber,
          roleId: roleID,
        },
        select: userResponseSelect,
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
    const user = await this.prismaService.user.findUnique({
      where: {
        email: body.email,
      },
    });

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

    const safeUser = await this.prismaService.user.findUniqueOrThrow({
      where: {
        id: user.id,
      },
      select: userResponseSelect,
    });

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

      await this.prismaService.refreshToken.delete({
        where: {
          token: body.refreshToken,
        },
      });

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

    await this.prismaService.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        deviceId: DEFAULT_DEVICE_ID,
        expiresAt: new Date(refreshTokenPayload.exp * 1000),
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
