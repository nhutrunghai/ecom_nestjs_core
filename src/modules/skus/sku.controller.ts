import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
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
  CreateSkuDto,
  DeleteSkuResponseDto,
  SkuResponseDto,
  UpdateSkuDto,
  UpdateSkuStockDto,
} from './dto/sku.dto';
import { SkuService } from './sku.service';

@Controller()
export class SkuController {
  constructor(private readonly skuService: SkuService) {}

  @Get('products/:productId/skus')
  @ZodSerializerDto([SkuResponseDto])
  findAllByPublishedProduct(
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.skuService.findAllByPublishedProduct(productId);
  }

  @Get('skus/:skuId')
  @ZodSerializerDto(SkuResponseDto)
  findPublishedById(@Param('skuId', ParseIntPipe) skuId: number) {
    return this.skuService.findPublishedById(skuId);
  }

  @Post('products/:productId/skus')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @CheckPermission()
  @ZodSerializerDto(SkuResponseDto)
  create(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() body: CreateSkuDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.skuService.create(productId, body, user.sub);
  }

  @Put('skus/:skuId')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @CheckPermission()
  @ZodSerializerDto(SkuResponseDto)
  update(
    @Param('skuId', ParseIntPipe) skuId: number,
    @Body() body: UpdateSkuDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.skuService.update(skuId, body, user.sub);
  }

  @Patch('skus/:skuId/stock')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @CheckPermission()
  @ZodSerializerDto(SkuResponseDto)
  updateStock(
    @Param('skuId', ParseIntPipe) skuId: number,
    @Body() body: UpdateSkuStockDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.skuService.updateStock(skuId, body, user.sub);
  }

  @Delete('skus/:skuId')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @CheckPermission()
  @ZodSerializerDto(DeleteSkuResponseDto)
  delete(
    @Param('skuId', ParseIntPipe) skuId: number,
    @CurrentUser() user: RequestUser,
  ) {
    return this.skuService.delete(skuId, user.sub);
  }
}
