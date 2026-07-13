import { createZodDto } from 'nestjs-zod';
import {
  CreateRoleBodySchema,
  DeleteRoleResponseSchema,
  RoleResponseSchema,
  UpdateRoleBodySchema,
} from '../entities/role.model';

export class RoleResponseDto extends createZodDto(RoleResponseSchema) {}

export class CreateRoleDto extends createZodDto(CreateRoleBodySchema) {}

export class UpdateRoleDto extends createZodDto(UpdateRoleBodySchema) {}

export class DeleteRoleResponseDto extends createZodDto(
  DeleteRoleResponseSchema,
) {}
