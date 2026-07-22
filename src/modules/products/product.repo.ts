import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from 'src/database/prisma.service';
import type {
  CreateProductBody,
  ProductListQuery,
  UpdateProductBody,
} from './entities/product.model';

const productInclude = {
  brand: {
    select: {
      id: true,
      name: true,
      logo: true,
    },
  },
  categories: {
    where: {
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      logo: true,
    },
  },
  skus: {
    where: {
      deletedAt: null,
    },
    orderBy: {
      id: 'asc',
    },
  },
  productTranslations: {
    where: {
      deletedAt: null,
    },
    orderBy: {
      languageId: 'asc',
    },
  },
} as const;

@Injectable()
export class ProductRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(query: ProductListQuery, publishedOnly: boolean) {
    const where = this.buildWhere(query, publishedOnly);
    const skip = (query.page - 1) * query.limit;

    const [data, total] = await this.prismaService.$transaction([
      this.prismaService.product.findMany({
        where,
        include: productInclude,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: query.limit,
      }),
      this.prismaService.product.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  findById(productId: number, publishedOnly: boolean) {
    return this.prismaService.product.findFirst({
      where: {
        id: productId,
        deletedAt: null,
        ...(publishedOnly
          ? {
              publishedAt: {
                lte: new Date(),
              },
            }
          : {}),
      },
      include: productInclude,
    });
  }

  async findMissingReferences(
    brandId: number,
    categoryIds: number[],
    languageIds: string[],
  ) {
    const [brand, categories, languages] = await Promise.all([
      this.prismaService.brand.findFirst({
        where: {
          id: brandId,
          deletedAt: null,
        },
        select: { id: true },
      }),
      this.prismaService.category.findMany({
        where: {
          id: { in: categoryIds },
          deletedAt: null,
        },
        select: { id: true },
      }),
      this.prismaService.language.findMany({
        where: {
          id: { in: languageIds },
          deletedAt: null,
        },
        select: { id: true },
      }),
    ]);

    const existingCategoryIds = new Set(categories.map(({ id }) => id));
    const existingLanguageIds = new Set(languages.map(({ id }) => id));

    return {
      brandExists: brand !== null,
      missingCategoryIds: categoryIds.filter(
        (id) => !existingCategoryIds.has(id),
      ),
      missingLanguageIds: languageIds.filter(
        (id) => !existingLanguageIds.has(id),
      ),
    };
  }

  findActiveSkuIds(productId: number) {
    return this.prismaService.sKU.findMany({
      where: {
        productId,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });
  }

  create(data: CreateProductBody, actorId: number) {
    return this.prismaService.product.create({
      data: {
        name: data.name,
        basePrice: data.basePrice,
        virtualPrice: data.virtualPrice,
        brandId: data.brandId,
        publishedAt: data.publishedAt,
        images: data.images,
        variants: data.variants,
        createdById: actorId,
        categories: {
          connect: data.categoryIds.map((id) => ({ id })),
        },
        skus: {
          create: data.skus.map((sku) => ({
            value: sku.value,
            price: sku.price,
            stock: sku.stock,
            image: sku.image,
            createdById: actorId,
          })),
        },
        productTranslations: {
          create: data.translations.map((translation) => ({
            languageId: translation.languageId,
            name: translation.name,
            description: translation.description,
            createdById: actorId,
          })),
        },
      },
      include: productInclude,
    });
  }

  update(productId: number, data: UpdateProductBody, actorId: number) {
    return this.prismaService.$transaction(async (tx) => {
      await tx.product.update({
        where: {
          id: productId,
        },
        data: {
          name: data.name,
          basePrice: data.basePrice,
          virtualPrice: data.virtualPrice,
          brandId: data.brandId,
          publishedAt: data.publishedAt,
          images: data.images,
          variants: data.variants,
          updatedById: actorId,
          categories: data.categoryIds
            ? {
                set: data.categoryIds.map((id) => ({ id })),
              }
            : undefined,
        },
      });

      if (data.skus) {
        await this.syncSkus(tx, productId, data.skus, actorId);
      }

      if (data.translations) {
        await this.syncTranslations(tx, productId, data.translations, actorId);
      }

      return tx.product.findUniqueOrThrow({
        where: {
          id: productId,
        },
        include: productInclude,
      });
    });
  }

  softDelete(productId: number, actorId: number) {
    const deletedAt = new Date();

    return this.prismaService.$transaction(async (tx) => {
      await tx.sKU.updateMany({
        where: {
          productId,
          deletedAt: null,
        },
        data: {
          deletedAt,
          deletedById: actorId,
        },
      });

      await tx.productTranslation.updateMany({
        where: {
          productId,
          deletedAt: null,
        },
        data: {
          deletedAt,
          deletedById: actorId,
        },
      });

      return tx.product.update({
        where: {
          id: productId,
        },
        data: {
          deletedAt,
          deletedById: actorId,
          publishedAt: null,
        },
      });
    });
  }

  private buildWhere(
    query: ProductListQuery,
    publishedOnly: boolean,
  ): Prisma.ProductWhereInput {
    return {
      deletedAt: null,
      ...(publishedOnly
        ? {
            publishedAt: {
              lte: new Date(),
            },
          }
        : {}),
      ...(query.brandId ? { brandId: query.brandId } : {}),
      ...(query.categoryId
        ? {
            categories: {
              some: {
                id: query.categoryId,
                deletedAt: null,
              },
            },
          }
        : {}),
      ...(query.search
        ? {
            OR: [
              {
                name: {
                  contains: query.search,
                  mode: 'insensitive',
                },
              },
              {
                productTranslations: {
                  some: {
                    name: {
                      contains: query.search,
                      mode: 'insensitive',
                    },
                    deletedAt: null,
                  },
                },
              },
            ],
          }
        : {}),
    };
  }

  private async syncSkus(
    tx: Prisma.TransactionClient,
    productId: number,
    skus: NonNullable<UpdateProductBody['skus']>,
    actorId: number,
  ) {
    const deletedAt = new Date();
    await tx.sKU.updateMany({
      where: {
        productId,
        deletedAt: null,
      },
      data: {
        deletedAt,
        deletedById: actorId,
      },
    });

    for (const sku of skus) {
      if (sku.id) {
        await tx.sKU.update({
          where: { id: sku.id },
          data: {
            value: sku.value,
            price: sku.price,
            stock: sku.stock,
            image: sku.image,
            updatedById: actorId,
            deletedAt: null,
            deletedById: null,
          },
        });
      } else {
        await tx.sKU.create({
          data: {
            productId,
            value: sku.value,
            price: sku.price,
            stock: sku.stock,
            image: sku.image,
            createdById: actorId,
          },
        });
      }
    }
  }

  private async syncTranslations(
    tx: Prisma.TransactionClient,
    productId: number,
    translations: NonNullable<UpdateProductBody['translations']>,
    actorId: number,
  ) {
    const retainedLanguageIds = translations.map(
      (translation) => translation.languageId,
    );

    await tx.productTranslation.updateMany({
      where: {
        productId,
        deletedAt: null,
        ...(retainedLanguageIds.length > 0
          ? { languageId: { notIn: retainedLanguageIds } }
          : {}),
      },
      data: {
        deletedAt: new Date(),
        deletedById: actorId,
      },
    });

    for (const translation of translations) {
      const existing = await tx.productTranslation.findFirst({
        where: {
          productId,
          languageId: translation.languageId,
          deletedAt: null,
        },
        select: { id: true },
      });

      if (existing) {
        await tx.productTranslation.update({
          where: { id: existing.id },
          data: {
            name: translation.name,
            description: translation.description,
            updatedById: actorId,
          },
        });
      } else {
        await tx.productTranslation.create({
          data: {
            productId,
            languageId: translation.languageId,
            name: translation.name,
            description: translation.description,
            createdById: actorId,
          },
        });
      }
    }
  }
}
