import { Injectable } from '@nestjs/common';
import { VerificationCodeType } from 'generated/prisma/client';
import { PrismaService } from 'src/database/prisma.service';
import {
  CreateDeviceData,
  RegisterBody,
  UpdateDeviceActivityData,
} from './entities/auth.model';

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

  findUserById(id: number) {
    return this.prismaService.user.findUnique({
      where: {
        id,
      },
    });
  }

  findUserByEmail(email: string) {
    return this.prismaService.user.findUnique({
      where: {
        email,
      },
    });
  }

  createDevice(data: CreateDeviceData) {
    return this.prismaService.device.create({
      data,
    });
  }

  updateDeviceActivity(data: UpdateDeviceActivityData) {
    return this.prismaService.device.update({
      where: {
        id: data.id,
      },
      data: {
        userAgent: data.userAgent,
        ip: data.ip,
        isActive: data.isActive,
      },
    });
  }

  deactivateDevice(id: number) {
    return this.prismaService.device.update({
      where: {
        id,
      },
      data: {
        isActive: false,
      },
    });
  }

  findActiveDevicesByUserId(userId: number) {
    return this.prismaService.device.findMany({
      where: {
        userId,
        isActive: true,
      },
      select: {
        id: true,
        userId: true,
        userAgent: true,
        ip: true,
        lastActive: true,
        createdAt: true,
        isActive: true,
      },
      orderBy: {
        lastActive: 'desc',
      },
    });
  }

  async logoutDevice(userId: number, deviceId: number) {
    return this.prismaService.$transaction(async (tx) => {
      const device = await tx.device.findFirst({
        where: {
          id: deviceId,
          userId,
          isActive: true,
        },
        select: {
          id: true,
        },
      });

      if (!device) {
        return false;
      }

      await tx.refreshToken.deleteMany({
        where: {
          userId,
          deviceId,
        },
      });

      await tx.device.update({
        where: {
          id: deviceId,
        },
        data: {
          isActive: false,
        },
      });

      return true;
    });
  }

  async logoutOtherDevices(userId: number, currentDeviceId: number) {
    return this.prismaService.$transaction(async (tx) => {
      await tx.refreshToken.deleteMany({
        where: {
          userId,
          deviceId: {
            not: currentDeviceId,
          },
        },
      });

      return tx.device.updateMany({
        where: {
          userId,
          id: {
            not: currentDeviceId,
          },
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });
    });
  }

  updateUserTotpSecret(data: { userId: number; totpSecret: string | null }) {
    return this.prismaService.user.update({
      where: {
        id: data.userId,
      },
      data: {
        totpSecret: data.totpSecret,
      },
    });
  }
  updateUserPassword(data: { userId: number; hashedPassword: string }) {
    return this.prismaService.user.update({
      where: {
        id: data.userId,
      },
      data: {
        password: data.hashedPassword,
      },
    });
  }

  deleteRefreshTokensByUserId(userId: number) {
    return this.prismaService.refreshToken.deleteMany({
      where: {
        userId,
      },
    });
  }

  deactivateDevicesByUserId(userId: number) {
    return this.prismaService.device.updateMany({
      where: {
        userId,
      },
      data: {
        isActive: false,
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
