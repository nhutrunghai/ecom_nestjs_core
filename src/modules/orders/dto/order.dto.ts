import { createZodDto } from 'nestjs-zod';
import {
  CheckoutBodySchema,
  CheckoutResponseSchema,
  OrderListQuerySchema,
  OrderListResponseSchema,
  OrderResponseSchema,
  UpdateOrderStatusBodySchema,
} from '../entities/order.model';

export class CheckoutDto extends createZodDto(CheckoutBodySchema) {}

export class CheckoutResponseDto extends createZodDto(CheckoutResponseSchema) {}

export class OrderListQueryDto extends createZodDto(OrderListQuerySchema) {}

export class OrderListResponseDto extends createZodDto(
  OrderListResponseSchema,
) {}

export class OrderResponseDto extends createZodDto(OrderResponseSchema) {}

export class UpdateOrderStatusDto extends createZodDto(
  UpdateOrderStatusBodySchema,
) {}
