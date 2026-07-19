import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import type { UpdateProfileBody } from './entities/profile.model';

const profileSelect = {
  id: true,
  email: true,
  name: true,
  phoneNumber: true,
  avatar: true,
  status: true,
  roleId: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class ProfileRepository {
  constructor(private readonly prismaService: PrismaService) {}

  findByUserId(userId: number) {
    return this.prismaService.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
      select: profileSelect,
    });
  }

  update(userId: number, body: UpdateProfileBody) {
    return this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        name: body.name,
        phoneNumber: body.phoneNumber,
        avatar: body.avatar,
        updatedById: userId,
      },
      select: profileSelect,
    });
  }
}
