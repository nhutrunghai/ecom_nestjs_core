import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignOptions } from 'jsonwebtoken';
import env from '../../config/env.config';
import { TokenPayload } from '../types/jwt-token.type';

@Injectable()
export class JwtTokenService {
  constructor(private readonly jwtService: JwtService) {}

  signAccessToken(payload: Pick<TokenPayload, 'sub'>): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: env.JWT_ACCESS_TOKEN_SECRET,
      expiresIn: env.JWT_ACCESS_TOKEN_EXPIRES_IN as SignOptions['expiresIn'],
    });
  }

  signRefreshToken(payload: Pick<TokenPayload, 'sub'>): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: env.JWT_REFRESH_TOKEN_SECRET,
      expiresIn: env.JWT_REFRESH_TOKEN_EXPIRES_IN as SignOptions['expiresIn'],
    });
  }

  verifyAccessToken(token: string): Promise<TokenPayload> {
    return this.jwtService.verifyAsync<TokenPayload>(token, {
      secret: env.JWT_ACCESS_TOKEN_SECRET,
    });
  }

  verifyRefreshToken(token: string): Promise<TokenPayload> {
    return this.jwtService.verifyAsync<TokenPayload>(token, {
      secret: env.JWT_REFRESH_TOKEN_SECRET,
    });
  }
}
