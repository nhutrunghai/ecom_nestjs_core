import { createZodDto } from 'nestjs-zod';
import {
  CreateSkuBodySchema,
  DeleteSkuResponseSchema,
  SkuResponseSchema,
  UpdateSkuBodySchema,
  UpdateSkuStockBodySchema,
} from '../entities/sku.model';

export class CreateSkuDto extends createZodDto(CreateSkuBodySchema) {}

export class UpdateSkuDto extends createZodDto(UpdateSkuBodySchema) {}

export class UpdateSkuStockDto extends createZodDto(UpdateSkuStockBodySchema) {}

export class SkuResponseDto extends createZodDto(SkuResponseSchema) {}

export class DeleteSkuResponseDto extends createZodDto(
  DeleteSkuResponseSchema,
) {}
