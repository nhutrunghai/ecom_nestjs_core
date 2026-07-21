import { createZodDto } from 'nestjs-zod';
import {
  CreateUserBodySchema,
  DeleteUserResponseSchema,
  UpdateUserBodySchema,
  UserResponseSchema,
} from '../entities/user.model';

export class UserResponseDto extends createZodDto(UserResponseSchema) {}

export class CreateUserDto extends createZodDto(CreateUserBodySchema) {}

export class UpdateUserDto extends createZodDto(UpdateUserBodySchema) {}

export class DeleteUserResponseDto extends createZodDto(
  DeleteUserResponseSchema,
) {}
