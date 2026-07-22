import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CategoryRepository } from './category.repo';
import type {
  CreateCategoryBody,
  UpdateCategoryBody,
} from './entities/category.model';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  findAll() {
    return this.categoryRepository.findAll();
  }

  async findById(categoryId: number) {
    const category = await this.categoryRepository.findById(categoryId);
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async create(body: CreateCategoryBody, actorId: number) {
    if (body.parentCategoryId) {
      await this.ensureParentExists(body.parentCategoryId);
    }
    return this.categoryRepository.create(body, actorId);
  }

  async update(categoryId: number, body: UpdateCategoryBody, actorId: number) {
    await this.findById(categoryId);

    if (body.parentCategoryId !== undefined && body.parentCategoryId !== null) {
      await this.ensureValidParent(categoryId, body.parentCategoryId);
    }

    return this.categoryRepository.update(categoryId, body, actorId);
  }

  async delete(categoryId: number, actorId: number) {
    await this.findById(categoryId);
    const [productCount, childCount] =
      await this.categoryRepository.countDependencies(categoryId);

    if (productCount > 0) {
      throw new ConflictException('Category is being used by active products');
    }

    if (childCount > 0) {
      throw new ConflictException('Category still has active child categories');
    }

    await this.categoryRepository.softDelete(categoryId, actorId);
    return { message: 'Category deleted successfully' };
  }

  private async ensureParentExists(parentCategoryId: number) {
    if (!(await this.categoryRepository.findParent(parentCategoryId))) {
      throw new BadRequestException('Parent category not found');
    }
  }

  private async ensureValidParent(
    categoryId: number,
    parentCategoryId: number,
  ) {
    if (categoryId === parentCategoryId) {
      throw new BadRequestException('Category cannot be its own parent');
    }

    let currentParentId: number | null = parentCategoryId;
    const visited = new Set<number>();

    while (currentParentId !== null) {
      if (currentParentId === categoryId || visited.has(currentParentId)) {
        throw new BadRequestException(
          'Category hierarchy would contain a cycle',
        );
      }

      visited.add(currentParentId);
      const parent = await this.categoryRepository.findParent(currentParentId);

      if (!parent) {
        throw new BadRequestException('Parent category not found');
      }

      currentParentId = parent.parentCategoryId;
    }
  }
}
