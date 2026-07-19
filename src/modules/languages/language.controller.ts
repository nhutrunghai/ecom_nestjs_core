import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';
import { CheckPermission } from 'src/shared/decorators/check-permission.decorator';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { PermissionGuard } from 'src/shared/guards/permission.guard';
import type { RequestUser } from 'src/shared/types/jwt-token.type';
import {
  CreateLanguageDto,
  DeleteLanguageResponseDto,
  LanguageResponseDto,
  UpdateLanguageDto,
} from './dto/language.dto';
import { LanguageService } from './language.service';

@Controller('languages')
@UseGuards(JwtAuthGuard, PermissionGuard)
@CheckPermission()
export class LanguageController {
  constructor(private readonly languageService: LanguageService) {}

  @Get()
  findAll() {
    return this.languageService.findAll();
  }

  @Get(':languageId')
  @ZodSerializerDto(LanguageResponseDto)
  findById(@Param('languageId') languageId: string) {
    return this.languageService.findById(languageId);
  }

  @Post()
  @ZodSerializerDto(LanguageResponseDto)
  create(@Body() body: CreateLanguageDto, @CurrentUser() user: RequestUser) {
    return this.languageService.create(body, user.sub);
  }

  @Put()
  @ZodSerializerDto(LanguageResponseDto)
  update(@Body() body: UpdateLanguageDto, @CurrentUser() user: RequestUser) {
    return this.languageService.update(body, user.sub);
  }

  @Delete(':languageId')
  @ZodSerializerDto(DeleteLanguageResponseDto)
  delete(
    @Param('languageId') languageId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.languageService.delete(languageId, user.sub);
  }
}
