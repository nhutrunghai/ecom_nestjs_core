import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignOptions } from 'jsonwebtoken';
import env from '../../config/env.config';
import {
  AccessTokenPayload,
  RefreshTokenPayload,
} from '../types/jwt-token.type';

type SignAccessTokenPayload = Pick<
  AccessTokenPayload,
  'sub' | 'roleId' | 'deviceId' | 'jti'
>;

type SignRefreshTokenPayload = Pick<RefreshTokenPayload, 'sub' | 'jti'>;

@Injectable()
export class JwtTokenService {
  constructor(private readonly jwtService: JwtService) {}

  signAccessToken(payload: SignAccessTokenPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: env.JWT_ACCESS_TOKEN_SECRET,
      expiresIn: env.JWT_ACCESS_TOKEN_EXPIRES_IN as SignOptions['expiresIn'],
    });
  }

  signRefreshToken(payload: SignRefreshTokenPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: env.JWT_REFRESH_TOKEN_SECRET,
      expiresIn: env.JWT_REFRESH_TOKEN_EXPIRES_IN as SignOptions['expiresIn'],
    });
  }

  verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    return this.jwtService.verifyAsync<AccessTokenPayload>(token, {
      secret: env.JWT_ACCESS_TOKEN_SECRET,
    });
  }

  verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
    return this.jwtService.verifyAsync<RefreshTokenPayload>(token, {
      secret: env.JWT_REFRESH_TOKEN_SECRET,
    });
  }
}
