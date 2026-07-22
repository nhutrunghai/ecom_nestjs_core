import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartRepository } from './cart.repo';
import { CartService } from './cart.service';

@Module({
  controllers: [CartController],
  providers: [CartService, CartRepository],
})
export class CartModule {}
