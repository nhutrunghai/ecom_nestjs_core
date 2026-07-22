import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
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
  CheckoutDto,
  CheckoutResponseDto,
  OrderListQueryDto,
  OrderListResponseDto,
  OrderResponseDto,
  UpdateOrderStatusDto,
} from './dto/order.dto';
import { OrderService } from './order.service';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('checkout')
  @ZodSerializerDto(CheckoutResponseDto)
  checkout(@Body() body: CheckoutDto, @CurrentUser() user: RequestUser) {
    return this.orderService.checkout(user.sub, body);
  }

  @Get('management')
  @UseGuards(PermissionGuard)
  @CheckPermission()
  @ZodSerializerDto(OrderListResponseDto)
  findOrdersForManagement(
    @CurrentUser() user: RequestUser,
    @Query() query: OrderListQueryDto,
  ) {
    return this.orderService.findOrdersForManagement(user.sub, query);
  }

  @Get('management/:orderId')
  @UseGuards(PermissionGuard)
  @CheckPermission()
  @ZodSerializerDto(OrderResponseDto)
  findOrderForManagement(
    @Param('orderId', ParseIntPipe) orderId: number,
    @CurrentUser() user: RequestUser,
  ) {
    return this.orderService.findOrderForManagement(orderId, user.sub);
  }

  @Patch('management/:orderId/status')
  @UseGuards(PermissionGuard)
  @CheckPermission()
  @ZodSerializerDto(OrderResponseDto)
  updateStatusForManagement(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body() body: UpdateOrderStatusDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.orderService.updateStatusForManagement(orderId, user.sub, body);
  }

  @Get()
  @ZodSerializerDto(OrderListResponseDto)
  findMyOrders(
    @CurrentUser() user: RequestUser,
    @Query() query: OrderListQueryDto,
  ) {
    return this.orderService.findMyOrders(user.sub, query);
  }

  @Get(':orderId')
  @ZodSerializerDto(OrderResponseDto)
  findMyOrder(
    @Param('orderId', ParseIntPipe) orderId: number,
    @CurrentUser() user: RequestUser,
  ) {
    return this.orderService.findMyOrder(orderId, user.sub);
  }

  @Patch(':orderId/cancel')
  @ZodSerializerDto(OrderResponseDto)
  cancelMyOrder(
    @Param('orderId', ParseIntPipe) orderId: number,
    @CurrentUser() user: RequestUser,
  ) {
    return this.orderService.cancelMyOrder(orderId, user.sub);
  }
}
