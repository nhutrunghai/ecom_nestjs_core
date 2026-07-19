import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import type { RequestUser } from 'src/shared/types/jwt-token.type';
import { ProfileResponseDto, UpdateProfileDto } from './dto/profile.dto';
import { ProfileService } from './profile.service';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ZodSerializerDto(ProfileResponseDto)
  getProfile(@CurrentUser() user: RequestUser) {
    return this.profileService.getProfile(user.sub);
  }

  @Put()
  @ZodSerializerDto(ProfileResponseDto)
  updateProfile(
    @CurrentUser() user: RequestUser,
    @Body() body: UpdateProfileDto,
  ) {
    return this.profileService.updateProfile(user.sub, body);
  }
}
