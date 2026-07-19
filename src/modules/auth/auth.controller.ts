import {
  Body,
  Controller,
  Get,
  Ip,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { UserAgent } from 'src/shared/decorators/user-agent.decorator';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import type { RequestUser } from 'src/shared/types/jwt-token.type';
import { ZodSerializerDto } from 'nestjs-zod';
import { AuthService } from './auth.service';
import {
  Disable2FaDto,
  Disable2FaResponseDto,
  Enable2FaResponseDto,
  ForgotPasswordDto,
  ForgotPasswordResponseDto,
  LoginDto,
  LoginResponseDto,
  LogoutResponseDto,
  RefreshTokenDto,
  RefreshTokenResponseDto,
  DeviceResponseDto,
  RegisterDto,
  RegisterResponseDto,
  SendOtpDto,
  SendOtpResponseDto,
} from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('2fa/enable')
  @UseGuards(JwtAuthGuard)
  @ZodSerializerDto(Enable2FaResponseDto)
  enable2Fa(@CurrentUser() user: RequestUser) {
    return this.authService.enable2Fa(user.sub);
  }

  @Post('2fa/disable')
  @UseGuards(JwtAuthGuard)
  @ZodSerializerDto(Disable2FaResponseDto)
  disable2Fa(@CurrentUser() user: RequestUser, @Body() body: Disable2FaDto) {
    return this.authService.disable2Fa(user.sub, body);
  }
  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: RequestUser) {
    return user;
  }

  @Get('devices')
  @UseGuards(JwtAuthGuard)
  @ZodSerializerDto([DeviceResponseDto])
  getActiveDevices(@CurrentUser() user: RequestUser) {
    return this.authService.getActiveDevices(user.sub, user.deviceId);
  }

  @Post('devices/:deviceId/logout')
  @UseGuards(JwtAuthGuard)
  logoutDevice(
    @CurrentUser() user: RequestUser,
    @Param('deviceId', ParseIntPipe) deviceId: number,
  ) {
    return this.authService.logoutDevice(user.sub, deviceId);
  }

  @Post('devices/logout-others')
  @UseGuards(JwtAuthGuard)
  logoutOtherDevices(@CurrentUser() user: RequestUser) {
    return this.authService.logoutOtherDevices(user.sub, user.deviceId);
  }
  @Post('otp')
  @ZodSerializerDto(SendOtpResponseDto)
  sendOtp(@Body() body: SendOtpDto) {
    return this.authService.sendOtp(body);
  }

  @Post('register')
  @ZodSerializerDto(RegisterResponseDto)
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('forgot-password')
  @ZodSerializerDto(ForgotPasswordResponseDto)
  forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.forgotPassword(body);
  }
  @Post('login')
  @ZodSerializerDto(LoginResponseDto)
  login(
    @Body() loginDto: LoginDto,
    @UserAgent() userAgent: string,
    @Ip() ip: string,
  ) {
    return this.authService.login(loginDto, {
      userAgent,
      ip,
    });
  }

  @Post('logout')
  @ZodSerializerDto(LogoutResponseDto)
  logout(@Body() body: RefreshTokenDto) {
    return this.authService.logout(body);
  }
  @Post('refresh-token')
  @ZodSerializerDto(RefreshTokenResponseDto)
  refreshToken(
    @Body() body: RefreshTokenDto,
    @UserAgent() userAgent: string,
    @Ip() ip: string,
  ) {
    return this.authService.refreshToken(body, {
      userAgent,
      ip,
    });
  }
}
