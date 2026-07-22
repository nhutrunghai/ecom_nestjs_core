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
import { BrandService } from './brand.service';
import {
  BrandResponseDto,
  CreateBrandDto,
  DeleteBrandResponseDto,
  UpdateBrandDto,
} from './dto/brand.dto';

@Controller('brands')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Get()
  @ZodSerializerDto([BrandResponseDto])
  findAll() {
    return this.brandService.findAll();
  }

  @Get(':brandId')
  @ZodSerializerDto(BrandResponseDto)
  findById(@Param('brandId', ParseIntPipe) brandId: number) {
    return this.brandService.findById(brandId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @CheckPermission()
  @ZodSerializerDto(BrandResponseDto)
  create(@Body() body: CreateBrandDto, @CurrentUser() user: RequestUser) {
    return this.brandService.create(body, user.sub);
  }

  @Put(':brandId')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @CheckPermission()
  @ZodSerializerDto(BrandResponseDto)
  update(
    @Param('brandId', ParseIntPipe) brandId: number,
    @Body() body: UpdateBrandDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.brandService.update(brandId, body, user.sub);
  }

  @Delete(':brandId')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @CheckPermission()
  @ZodSerializerDto(DeleteBrandResponseDto)
  delete(
    @Param('brandId', ParseIntPipe) brandId: number,
    @CurrentUser() user: RequestUser,
  ) {
    return this.brandService.delete(brandId, user.sub);
  }
}
