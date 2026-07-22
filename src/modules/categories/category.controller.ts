import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
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
import { CategoryService } from './category.service';
import {
  CategoryResponseDto,
  CreateCategoryDto,
  DeleteCategoryResponseDto,
  UpdateCategoryDto,
} from './dto/category.dto';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @ZodSerializerDto([CategoryResponseDto])
  findAll() {
    return this.categoryService.findAll();
  }

  @Get(':categoryId')
  @ZodSerializerDto(CategoryResponseDto)
  findById(@Param('categoryId', ParseIntPipe) categoryId: number) {
    return this.categoryService.findById(categoryId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @CheckPermission()
  @ZodSerializerDto(CategoryResponseDto)
  create(@Body() body: CreateCategoryDto, @CurrentUser() user: RequestUser) {
    return this.categoryService.create(body, user.sub);
  }

  @Put(':categoryId')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @CheckPermission()
  @ZodSerializerDto(CategoryResponseDto)
  update(
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Body() body: UpdateCategoryDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.categoryService.update(categoryId, body, user.sub);
  }

  @Delete(':categoryId')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @CheckPermission()
  @ZodSerializerDto(DeleteCategoryResponseDto)
  delete(
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @CurrentUser() user: RequestUser,
  ) {
    return this.categoryService.delete(categoryId, user.sub);
  }
}
