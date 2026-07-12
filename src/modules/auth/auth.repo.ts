import { Injectable } from '@nestjs/common';
import { VerificationCodeType } from 'generated/prisma/client';
import { PrismaService } from 'src/database/prisma.service';
import { RegisterBody } from './entities/auth.model';

export const userResponseSelect = {
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
export class AuthRepository {
  constructor(private readonly prismaService: PrismaService) {}

  createUser(body: RegisterBody, hashedPassword: string, roleId: number) {
    return this.prismaService.user.create({
      data: {
        email: body.email,
        password: hashedPassword,
        name: body.name,
        phoneNumber: body.phoneNumber,
        roleId,
      },
      select: userResponseSelect,
    });
  }

  findUserByEmail(email: string) {
    return this.prismaService.user.findUnique({
      where: {
        email,
      },
    });
  }

  upsertVerificationCode(data: {
    email: string;
    code: string;
    type: VerificationCodeType;
    expiresAt: Date;
  }) {
    return this.prismaService.verificationCode.upsert({
      where: {
        email_type: {
          email: data.email,
          type: data.type,
        },
      },
      create: data,
      update: {
        code: data.code,
        expiresAt: data.expiresAt,
        createdAt: new Date(),
      },
    });
  }

  findValidVerificationCode(data: {
    email: string;
    code: string;
    type: VerificationCodeType;
  }) {
    return this.prismaService.verificationCode.findFirst({
      where: {
        email: data.email,
        code: data.code,
        type: data.type,
        expiresAt: {
          gt: new Date(),
        },
      },
    });
  }

  deleteVerificationCode(data: { email: string; type: VerificationCodeType }) {
    return this.prismaService.verificationCode.delete({
      where: {
        email_type: {
          email: data.email,
          type: data.type,
        },
      },
    });
  }

  createRefreshToken(data: {
    token: string;
    userId: number;
    deviceId: number;
    expiresAt: Date;
  }) {
    return this.prismaService.refreshToken.create({
      data,
    });
  }

  deleteRefreshToken(token: string) {
    return this.prismaService.refreshToken.delete({
      where: {
        token,
      },
    });
  }
}
