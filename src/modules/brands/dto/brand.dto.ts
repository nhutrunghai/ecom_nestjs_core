import { createZodDto } from 'nestjs-zod';
import {
  BrandResponseSchema,
  CreateBrandBodySchema,
  DeleteBrandResponseSchema,
  UpdateBrandBodySchema,
} from '../entities/brand.model';

export class BrandResponseDto extends createZodDto(BrandResponseSchema) {}
export class CreateBrandDto extends createZodDto(CreateBrandBodySchema) {}
export class UpdateBrandDto extends createZodDto(UpdateBrandBodySchema) {}
export class DeleteBrandResponseDto extends createZodDto(
  DeleteBrandResponseSchema,
) {}
