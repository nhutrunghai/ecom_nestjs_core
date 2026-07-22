import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  isPrismaErrorCode,
  PrismaErrorCode,
} from 'src/database/prisma-error.util';
import type {
  CreateProductBody,
  ProductListQuery,
  UpdateProductBody,
} from './entities/product.model';
import { ProductRepository } from './product.repo';

@Injectable()
export class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  findPublished(query: ProductListQuery) {
    return this.productRepository.findAll(query, true);
  }

  findAllForManagement(query: ProductListQuery) {
    return this.productRepository.findAll(query, false);
  }

  async findPublishedById(productId: number) {
    const product = await this.productRepository.findById(productId, true);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async findByIdForManagement(productId: number) {
    const product = await this.productRepository.findById(productId, false);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async create(body: CreateProductBody, actorId: number) {
    await this.validateReferences(
      body.brandId,
      body.categoryIds,
      body.translations.map((translation) => translation.languageId),
    );

    try {
      return await this.productRepository.create(body, actorId);
    } catch (error) {
      this.handleWriteError(error);
    }
  }

  async update(productId: number, body: UpdateProductBody, actorId: number) {
    const currentProduct = await this.findByIdForManagement(productId);
    const basePrice = body.basePrice ?? currentProduct.basePrice;
    const virtualPrice = body.virtualPrice ?? currentProduct.virtualPrice;

    if (virtualPrice < basePrice) {
      throw new BadRequestException(
        'Virtual price must be greater than or equal to base price',
      );
    }

    await this.validateReferences(
      body.brandId ?? currentProduct.brandId,
      body.categoryIds ?? [],
      body.translations?.map((translation) => translation.languageId) ?? [],
    );

    if (body.skus) {
      const activeSkus =
        await this.productRepository.findActiveSkuIds(productId);
      const activeSkuIds = new Set(activeSkus.map(({ id }) => id));
      const invalidSkuIds = body.skus
        .map((sku) => sku.id)
        .filter(
          (id): id is number => id !== undefined && !activeSkuIds.has(id),
        );

      if (invalidSkuIds.length > 0) {
        throw new BadRequestException(
          `SKU does not belong to product: ${invalidSkuIds.join(', ')}`,
        );
      }
    }

    try {
      return await this.productRepository.update(productId, body, actorId);
    } catch (error) {
      this.handleWriteError(error);
    }
  }

  async delete(productId: number, actorId: number) {
    await this.findByIdForManagement(productId);
    await this.productRepository.softDelete(productId, actorId);

    return {
      message: 'Product deleted successfully',
    };
  }

  private async validateReferences(
    brandId: number,
    categoryIds: number[],
    languageIds: string[],
  ) {
    const references = await this.productRepository.findMissingReferences(
      brandId,
      categoryIds,
      languageIds,
    );

    if (!references.brandExists) {
      throw new BadRequestException('Brand not found');
    }

    if (references.missingCategoryIds.length > 0) {
      throw new BadRequestException(
        `Categories not found: ${references.missingCategoryIds.join(', ')}`,
      );
    }

    if (references.missingLanguageIds.length > 0) {
      throw new BadRequestException(
        `Languages not found: ${references.missingLanguageIds.join(', ')}`,
      );
    }
  }

  private handleWriteError(error: unknown): never {
    if (isPrismaErrorCode(error, PrismaErrorCode.UniqueConstraintFailed)) {
      throw new ConflictException('SKU or product translation already exists');
    }

    if (isPrismaErrorCode(error, PrismaErrorCode.ForeignKeyConstraintFailed)) {
      throw new BadRequestException('Invalid product relation');
    }

    throw error;
  }
}
