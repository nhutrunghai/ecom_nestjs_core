import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import {
  CreateLanguageBody,
  UpdateLanguageBody,
} from './entities/language.model';

@Injectable()
export class LanguageRepository {
  constructor(private readonly prismaService: PrismaService) {}

  findAll() {
    return this.prismaService.language.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  findById(id: string) {
    return this.prismaService.language.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  create(data: CreateLanguageBody, userId: number) {
    return this.prismaService.language.create({
      data: {
        id: data.id,
        name: data.name,
        createdById: userId,
      },
    });
  }

  update(data: UpdateLanguageBody, userId: number) {
    return this.prismaService.language.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        updatedById: userId,
      },
    });
  }

  softDelete(id: string, userId: number) {
    return this.prismaService.language.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
        deletedById: userId,
      },
    });
  }
}
