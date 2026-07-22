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
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import type { RequestUser } from 'src/shared/types/jwt-token.type';
import { CartService } from './cart.service';
import {
  AddCartItemDto,
  CartItemResponseDto,
  CartMutationResponseDto,
  CartResponseDto,
  UpdateCartItemDto,
} from './dto/cart.dto';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ZodSerializerDto(CartResponseDto)
  findMyCart(@CurrentUser() user: RequestUser) {
    return this.cartService.findMyCart(user.sub);
  }

  @Post('items')
  @ZodSerializerDto(CartItemResponseDto)
  addItem(@Body() body: AddCartItemDto, @CurrentUser() user: RequestUser) {
    return this.cartService.addItem(user.sub, body);
  }

  @Put('items/:cartItemId')
  @ZodSerializerDto(CartItemResponseDto)
  updateItem(
    @Param('cartItemId', ParseIntPipe) cartItemId: number,
    @Body() body: UpdateCartItemDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.cartService.updateItem(cartItemId, user.sub, body);
  }

  @Delete('items/:cartItemId')
  @ZodSerializerDto(CartMutationResponseDto)
  deleteItem(
    @Param('cartItemId', ParseIntPipe) cartItemId: number,
    @CurrentUser() user: RequestUser,
  ) {
    return this.cartService.deleteItem(cartItemId, user.sub);
  }

  @Delete()
  @ZodSerializerDto(CartMutationResponseDto)
  clear(@CurrentUser() user: RequestUser) {
    return this.cartService.clear(user.sub);
  }
}
