import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  AddCartItemBody,
  UpdateCartItemBody,
} from './entities/cart.model';
import {
  CartRepository,
  CartSkuUnavailableError,
  CartStockExceededError,
} from './cart.repo';

type CartItemWithRelations = Awaited<
  ReturnType<CartRepository['findByIdAndUser']>
>;

@Injectable()
export class CartService {
  constructor(private readonly cartRepository: CartRepository) {}

  async findMyCart(userId: number) {
    const items = await this.cartRepository.findAllByUser(userId);
    const mappedItems = items.map((item) => this.mapItem(item));

    return {
      items: mappedItems,
      totalItems: mappedItems.reduce((total, item) => total + item.quantity, 0),
      subtotal: mappedItems.reduce(
        (total, item) => total + (item.available ? item.lineTotal : 0),
        0,
      ),
    };
  }

  async addItem(userId: number, body: AddCartItemBody) {
    try {
      const item = await this.cartRepository.addItem(
        userId,
        body.skuId,
        body.quantity,
      );

      return this.mapItem(item);
    } catch (error) {
      if (error instanceof CartSkuUnavailableError) {
        throw new NotFoundException('SKU not found or product is unavailable');
      }

      if (error instanceof CartStockExceededError) {
        throw new BadRequestException(
          `Only ${error.stock} item(s) are in stock`,
        );
      }

      throw error;
    }
  }

  async updateItem(
    cartItemId: number,
    userId: number,
    body: UpdateCartItemBody,
  ) {
    const item = await this.findOwnedItem(cartItemId, userId);
    const sku = await this.cartRepository.findAvailableSku(item.skuId);

    if (!sku) {
      throw new BadRequestException('SKU or product is no longer available');
    }

    this.ensureStock(body.quantity, sku.stock);

    return this.mapItem(
      await this.cartRepository.update(cartItemId, body.quantity),
    );
  }

  async deleteItem(cartItemId: number, userId: number) {
    await this.findOwnedItem(cartItemId, userId);
    await this.cartRepository.delete(cartItemId);

    return { message: 'Cart item removed successfully' };
  }

  async clear(userId: number) {
    await this.cartRepository.clear(userId);

    return { message: 'Cart cleared successfully' };
  }

  private async findOwnedItem(cartItemId: number, userId: number) {
    const item = await this.cartRepository.findByIdAndUser(cartItemId, userId);

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    return item;
  }

  private ensureStock(quantity: number, stock: number) {
    if (quantity > stock) {
      throw new BadRequestException(`Only ${stock} item(s) are in stock`);
    }
  }

  private mapItem(item: NonNullable<CartItemWithRelations>) {
    const now = new Date();
    const available =
      item.sku.deletedAt === null &&
      item.sku.product.deletedAt === null &&
      item.sku.product.publishedAt !== null &&
      item.sku.product.publishedAt <= now &&
      item.sku.stock >= item.quantity;

    return {
      id: item.id,
      quantity: item.quantity,
      skuId: item.skuId,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      available,
      lineTotal: item.sku.price * item.quantity,
      sku: {
        id: item.sku.id,
        value: item.sku.value,
        price: item.sku.price,
        stock: item.sku.stock,
        image: item.sku.image,
        product: {
          id: item.sku.product.id,
          name: item.sku.product.name,
          images: item.sku.product.images,
          publishedAt: item.sku.product.publishedAt,
        },
      },
    };
  }
}
