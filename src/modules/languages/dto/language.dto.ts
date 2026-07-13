import { createZodDto } from 'nestjs-zod';
import {
  CreateLanguageBodySchema,
  DeleteLanguageResponseSchema,
  LanguageResponseSchema,
  UpdateLanguageBodySchema,
} from '../entities/language.model';

export class LanguageResponseDto extends createZodDto(LanguageResponseSchema) {}

export class CreateLanguageDto extends createZodDto(CreateLanguageBodySchema) {}

export class UpdateLanguageDto extends createZodDto(UpdateLanguageBodySchema) {}

export class DeleteLanguageResponseDto extends createZodDto(
  DeleteLanguageResponseSchema,
) {}
