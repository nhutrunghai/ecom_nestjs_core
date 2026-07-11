import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, UserResponseDto } from './auth.dto';
import { ZodSerializerDto } from 'nestjs-zod';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ZodSerializerDto(UserResponseDto)
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }
}
