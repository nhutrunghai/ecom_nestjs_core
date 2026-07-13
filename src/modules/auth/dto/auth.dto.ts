import { createZodDto } from 'nestjs-zod';
import {
  CreateDeviceSchema,
  ForgotPasswordBodySchema,
  ForgotPasswordResponseSchema,
  LoginBodySchema,
  LoginResponseSchema,
  LogoutResponseSchema,
  RefreshTokenBodySchema,
  RefreshTokenResponseSchema,
  RegisterBodySchema,
  SendOtpBodySchema,
  SendOtpResponseSchema,
  UpdateDeviceActivitySchema,
  UserResponseSchema,
} from '../entities/auth.model';

export class RegisterDto extends createZodDto(RegisterBodySchema) {}

export class RegisterResponseDto extends createZodDto(UserResponseSchema) {}

export class ForgotPasswordDto extends createZodDto(ForgotPasswordBodySchema) {}

export class ForgotPasswordResponseDto extends createZodDto(
  ForgotPasswordResponseSchema,
) {}

export class LoginDto extends createZodDto(LoginBodySchema) {}

export class LoginResponseDto extends createZodDto(LoginResponseSchema) {}

export class LogoutResponseDto extends createZodDto(LogoutResponseSchema) {}

export class RefreshTokenDto extends createZodDto(RefreshTokenBodySchema) {}

export class RefreshTokenResponseDto extends createZodDto(
  RefreshTokenResponseSchema,
) {}

export class SendOtpDto extends createZodDto(SendOtpBodySchema) {}

export class SendOtpResponseDto extends createZodDto(SendOtpResponseSchema) {}

export class CreateDeviceDto extends createZodDto(CreateDeviceSchema) {}

export class UpdateDeviceActivityDto extends createZodDto(
  UpdateDeviceActivitySchema,
) {}
