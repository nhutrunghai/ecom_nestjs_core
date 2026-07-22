import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';
import { CheckPermission } from 'src/shared/decorators/check-permission.decorator';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { PermissionGuard } from 'src/shared/guards/permission.guard';
import type { RequestUser } from 'src/shared/types/jwt-token.type';
import {
  CreateProductDto,
  DeleteProductResponseDto,
  ProductListQueryDto,
  ProductListResponseDto,
  ProductResponseDto,
  UpdateProductDto,
} from './dto/product.dto';
import { ProductService } from './product.service';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ZodSerializerDto(ProductListResponseDto)
  findPublished(@Query() query: ProductListQueryDto) {
    return this.productService.findPublished(query);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @CheckPermission()
  @ZodSerializerDto(ProductListResponseDto)
  findAllForManagement(@Query() query: ProductListQueryDto) {
    return this.productService.findAllForManagement(query);
  }

  @Get('admin/:productId')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @CheckPermission()
  @ZodSerializerDto(ProductResponseDto)
  findByIdForManagement(@Param('productId', ParseIntPipe) productId: number) {
    return this.productService.findByIdForManagement(productId);
  }

  @Get(':productId')
  @ZodSerializerDto(ProductResponseDto)
  findPublishedById(@Param('productId', ParseIntPipe) productId: number) {
    return this.productService.findPublishedById(productId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @CheckPermission()
  @ZodSerializerDto(ProductResponseDto)
  create(@Body() body: CreateProductDto, @CurrentUser() user: RequestUser) {
    return this.productService.create(body, user.sub);
  }

  @Put(':productId')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @CheckPermission()
  @ZodSerializerDto(ProductResponseDto)
  update(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() body: UpdateProductDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.productService.update(productId, body, user.sub);
  }

  @Delete(':productId')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @CheckPermission()
  @ZodSerializerDto(DeleteProductResponseDto)
  delete(
    @Param('productId', ParseIntPipe) productId: number,
    @CurrentUser() user: RequestUser,
  ) {
    return this.productService.delete(productId, user.sub);
  }
}
