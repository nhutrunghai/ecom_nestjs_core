import { createZodDto } from 'nestjs-zod';
import {
  ProfileSchema,
  UpdateProfileBodySchema,
} from '../entities/profile.model';

export class ProfileResponseDto extends createZodDto(ProfileSchema) {}

export class UpdateProfileDto extends createZodDto(UpdateProfileBodySchema) {}
