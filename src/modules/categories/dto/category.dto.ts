import { createZodDto } from 'nestjs-zod';
import {
  CategoryResponseSchema,
  CreateCategoryBodySchema,
  DeleteCategoryResponseSchema,
  UpdateCategoryBodySchema,
} from '../entities/category.model';

export class CategoryResponseDto extends createZodDto(CategoryResponseSchema) {}
export class CreateCategoryDto extends createZodDto(CreateCategoryBodySchema) {}
export class UpdateCategoryDto extends createZodDto(UpdateCategoryBodySchema) {}
export class DeleteCategoryResponseDto extends createZodDto(
  DeleteCategoryResponseSchema,
) {}
