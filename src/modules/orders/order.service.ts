import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus } from 'generated/prisma/client';
import { RoleName } from 'src/shared/constants/role.constants';
import type {
  CheckoutBody,
  OrderListQuery,
  UpdateOrderStatusBody,
} from './entities/order.model';
import {
  CheckoutItemUnavailableError,
  OrderRepository,
  OrderStateChangedError,
} from './order.repo';

const managementTransitions: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING_PAYMENT]: [
    OrderStatus.PENDING_PICKUP,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.PENDING_PICKUP]: [
    OrderStatus.PENDING_DELIVERY,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.PENDING_DELIVERY]: [OrderStatus.DELIVERED, OrderStatus.RETURNED],
  [OrderStatus.DELIVERED]: [OrderStatus.RETURNED],
  [OrderStatus.RETURNED]: [],
  [OrderStatus.CANCELLED]: [],
};

@Injectable()
export class OrderService {
  constructor(private readonly orderRepository: OrderRepository) {}

  async checkout(userId: number, body: CheckoutBody) {
    try {
      const result = await this.orderRepository.checkout(userId, body);

      return {
        paymentId: result.paymentId,
        orders: result.orders.map((order) => this.mapOrder(order)),
      };
    } catch (error) {
      if (error instanceof CheckoutItemUnavailableError) {
        throw new ConflictException(error.message);
      }

      throw error;
    }
  }

  async findMyOrders(userId: number, query: OrderListQuery) {
    const result = await this.orderRepository.findAllForUser(userId, query);

    return {
      ...result,
      data: result.data.map((order) => this.mapOrder(order)),
    };
  }

  async findMyOrder(orderId: number, userId: number) {
    const order = await this.orderRepository.findByIdForUser(orderId, userId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.mapOrder(order);
  }

  async cancelMyOrder(orderId: number, userId: number) {
    const order = await this.orderRepository.findByIdForUser(orderId, userId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (
      order.status !== OrderStatus.PENDING_PAYMENT &&
      order.status !== OrderStatus.PENDING_PICKUP
    ) {
      throw new BadRequestException(
        `Cannot cancel an order with status ${order.status}`,
      );
    }

    return this.changeStatus(
      order.id,
      order.status,
      OrderStatus.CANCELLED,
      userId,
    );
  }

  async findOrdersForManagement(actorId: number, query: OrderListQuery) {
    const shopId = await this.getManagementShopScope(actorId);
    const result = await this.orderRepository.findAllForManagement(
      shopId,
      query,
    );

    return {
      ...result,
      data: result.data.map((order) => this.mapOrder(order)),
    };
  }

  async findOrderForManagement(orderId: number, actorId: number) {
    const shopId = await this.getManagementShopScope(actorId);
    const order = await this.orderRepository.findByIdForManagement(
      orderId,
      shopId,
    );

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.mapOrder(order);
  }

  async updateStatusForManagement(
    orderId: number,
    actorId: number,
    body: UpdateOrderStatusBody,
  ) {
    const shopId = await this.getManagementShopScope(actorId);
    const order = await this.orderRepository.findByIdForManagement(
      orderId,
      shopId,
    );

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (!managementTransitions[order.status].includes(body.status)) {
      throw new BadRequestException(
        `Cannot change order status from ${order.status} to ${body.status}`,
      );
    }

    return this.changeStatus(order.id, order.status, body.status, actorId);
  }

  private async changeStatus(
    orderId: number,
    currentStatus: OrderStatus,
    nextStatus: OrderStatus,
    actorId: number,
  ) {
    try {
      const order = await this.orderRepository.changeStatus(
        orderId,
        currentStatus,
        nextStatus,
        actorId,
      );

      return this.mapOrder(order);
    } catch (error) {
      if (error instanceof OrderStateChangedError) {
        throw new ConflictException(
          'Order status changed concurrently; please reload and try again',
        );
      }

      throw error;
    }
  }

  private async getManagementShopScope(actorId: number) {
    const user = await this.orderRepository.findRoleName(actorId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.role.name === RoleName.ADMIN ? undefined : actorId;
  }

  private mapOrder<
    T extends {
      items: Array<{ skuPrice: number; quantity: number }>;
    },
  >(order: T) {
    const items = order.items.map((item) => ({
      ...item,
      lineTotal: item.skuPrice * item.quantity,
    }));

    return {
      ...order,
      items,
      totalAmount: items.reduce((total, item) => total + item.lineTotal, 0),
    };
  }
}
