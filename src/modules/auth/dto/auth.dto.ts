import { createZodDto } from 'nestjs-zod';
import {
  CreateDeviceSchema,
  DeviceResponseSchema,
  Disable2FaBodySchema,
  Disable2FaResponseSchema,
  Enable2FaResponseSchema,
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

export class Enable2FaResponseDto extends createZodDto(
  Enable2FaResponseSchema,
) {}

export class Disable2FaDto extends createZodDto(Disable2FaBodySchema) {}

export class Disable2FaResponseDto extends createZodDto(
  Disable2FaResponseSchema,
) {}
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

export class DeviceResponseDto extends createZodDto(DeviceResponseSchema) {}
