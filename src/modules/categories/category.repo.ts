import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import type {
  CreateCategoryBody,
  UpdateCategoryBody,
} from './entities/category.model';

@Injectable()
export class CategoryRepository {
  constructor(private readonly prismaService: PrismaService) {}

  findAll() {
    return this.prismaService.category.findMany({
      where: { deletedAt: null },
      orderBy: [{ parentCategoryId: 'asc' }, { name: 'asc' }],
    });
  }

  findById(categoryId: number) {
    return this.prismaService.category.findFirst({
      where: { id: categoryId, deletedAt: null },
    });
  }

  findParent(categoryId: number) {
    return this.prismaService.category.findFirst({
      where: { id: categoryId, deletedAt: null },
      select: {
        id: true,
        parentCategoryId: true,
      },
    });
  }

  countDependencies(categoryId: number) {
    return Promise.all([
      this.prismaService.product.count({
        where: {
          categories: { some: { id: categoryId } },
          deletedAt: null,
        },
      }),
      this.prismaService.category.count({
        where: { parentCategoryId: categoryId, deletedAt: null },
      }),
    ]);
  }

  create(data: CreateCategoryBody, actorId: number) {
    return this.prismaService.category.create({
      data: {
        name: data.name,
        logo: data.logo,
        parentCategoryId: data.parentCategoryId,
        createdById: actorId,
      },
    });
  }

  update(categoryId: number, data: UpdateCategoryBody, actorId: number) {
    return this.prismaService.category.update({
      where: { id: categoryId },
      data: {
        name: data.name,
        logo: data.logo,
        parentCategoryId: data.parentCategoryId,
        updatedById: actorId,
      },
    });
  }

  softDelete(categoryId: number, actorId: number) {
    return this.prismaService.category.update({
      where: { id: categoryId },
      data: {
        deletedAt: new Date(),
        deletedById: actorId,
      },
    });
  }
}
