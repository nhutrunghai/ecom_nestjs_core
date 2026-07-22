import { AddCartItemBodySchema, UpdateCartItemBodySchema } from './cart.model';

describe('Cart schemas', () => {
  it('accepts positive integer quantities', () => {
    expect(
      AddCartItemBodySchema.safeParse({ skuId: 1, quantity: 2 }).success,
    ).toBe(true);
  });

  it('rejects zero and fractional quantities', () => {
    expect(UpdateCartItemBodySchema.safeParse({ quantity: 0 }).success).toBe(
      false,
    );
    expect(UpdateCartItemBodySchema.safeParse({ quantity: 1.5 }).success).toBe(
      false,
    );
  });
});
