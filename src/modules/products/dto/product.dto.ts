import { createZodDto } from 'nestjs-zod';
import {
  CreateProductBodySchema,
  DeleteProductResponseSchema,
  ProductListQuerySchema,
  ProductListResponseSchema,
  ProductResponseSchema,
  UpdateProductBodySchema,
} from '../entities/product.model';

export class ProductResponseDto extends createZodDto(ProductResponseSchema) {}

export class ProductListResponseDto extends createZodDto(
  ProductListResponseSchema,
) {}

export class ProductListQueryDto extends createZodDto(ProductListQuerySchema) {}

export class CreateProductDto extends createZodDto(CreateProductBodySchema) {}

export class UpdateProductDto extends createZodDto(UpdateProductBodySchema) {}

export class DeleteProductResponseDto extends createZodDto(
  DeleteProductResponseSchema,
) {}
