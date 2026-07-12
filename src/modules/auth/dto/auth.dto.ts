import { createZodDto } from 'nestjs-zod';
import {
  LoginBodySchema,
  LoginResponseSchema,
  RefreshTokenBodySchema,
  RefreshTokenResponseSchema,
  RegisterBodySchema,
  SendOtpBodySchema,
  SendOtpResponseSchema,
  UserResponseSchema,
} from '../entities/auth.model';

export class RegisterDto extends createZodDto(RegisterBodySchema) {}

export class RegisterResponseDto extends createZodDto(UserResponseSchema) {}

export class LoginDto extends createZodDto(LoginBodySchema) {}

export class LoginResponseDto extends createZodDto(LoginResponseSchema) {}

export class RefreshTokenDto extends createZodDto(RefreshTokenBodySchema) {}

export class RefreshTokenResponseDto extends createZodDto(
  RefreshTokenResponseSchema,
) {}

export class SendOtpDto extends createZodDto(SendOtpBodySchema) {}

export class SendOtpResponseDto extends createZodDto(SendOtpResponseSchema) {}
