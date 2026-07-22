import { OrderStatus } from '../../../../generated/prisma/enums';
import { CheckoutBodySchema, UpdateOrderStatusBodySchema } from './order.model';

const validCheckout = {
  cartItemIds: [1, 2],
  receiver: {
    name: 'Nguyen Van A',
    phoneNumber: '0900000000',
    address: 'Ho Chi Minh City',
  },
};

describe('Order schemas', () => {
  it('accepts a valid checkout payload', () => {
    expect(CheckoutBodySchema.safeParse(validCheckout).success).toBe(true);
  });

  it('rejects duplicate cart item ids', () => {
    expect(
      CheckoutBodySchema.safeParse({
        ...validCheckout,
        cartItemIds: [1, 1],
      }).success,
    ).toBe(false);
  });

  it('accepts a valid order status', () => {
    expect(
      UpdateOrderStatusBodySchema.safeParse({
        status: OrderStatus.PENDING_DELIVERY,
      }).success,
    ).toBe(true);
  });
});
