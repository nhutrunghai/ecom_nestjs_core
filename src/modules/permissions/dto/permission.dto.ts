import { createZodDto } from 'nestjs-zod';
import {
  CreatePermissionBodySchema,
  DeletePermissionResponseSchema,
  PermissionResponseSchema,
  UpdatePermissionBodySchema,
} from '../entities/permission.model';

export class PermissionResponseDto extends createZodDto(
  PermissionResponseSchema,
) {}

export class CreatePermissionDto extends createZodDto(
  CreatePermissionBodySchema,
) {}

export class UpdatePermissionDto extends createZodDto(
  UpdatePermissionBodySchema,
) {}

export class DeletePermissionResponseDto extends createZodDto(
  DeletePermissionResponseSchema,
) {}
