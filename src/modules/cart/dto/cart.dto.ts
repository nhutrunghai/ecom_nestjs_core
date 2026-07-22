import { createZodDto } from 'nestjs-zod';
import {
  AddCartItemBodySchema,
  CartItemResponseSchema,
  CartMutationResponseSchema,
  CartResponseSchema,
  UpdateCartItemBodySchema,
} from '../entities/cart.model';

export class AddCartItemDto extends createZodDto(AddCartItemBodySchema) {}

export class UpdateCartItemDto extends createZodDto(UpdateCartItemBodySchema) {}

export class CartItemResponseDto extends createZodDto(CartItemResponseSchema) {}

export class CartResponseDto extends createZodDto(CartResponseSchema) {}

export class CartMutationResponseDto extends createZodDto(
  CartMutationResponseSchema,
) {}
