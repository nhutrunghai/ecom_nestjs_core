import {
  CreateSkuBodySchema,
  UpdateSkuBodySchema,
  UpdateSkuStockBodySchema,
} from './sku.model';

const validSku = {
  value: 'BLACK-128GB',
  price: 1000,
  stock: 10,
  image: 'https://example.com/black.jpg',
};

describe('SKU schemas', () => {
  it('accepts a valid create payload', () => {
    expect(CreateSkuBodySchema.safeParse(validSku).success).toBe(true);
  });

  it('rejects a negative stock', () => {
    expect(
      CreateSkuBodySchema.safeParse({ ...validSku, stock: -1 }).success,
    ).toBe(false);
  });

  it('rejects an empty update payload', () => {
    expect(UpdateSkuBodySchema.safeParse({}).success).toBe(false);
  });

  it('only accepts a non-negative integer in the stock payload', () => {
    expect(UpdateSkuStockBodySchema.safeParse({ stock: 5 }).success).toBe(true);
    expect(UpdateSkuStockBodySchema.safeParse({ stock: 1.5 }).success).toBe(
      false,
    );
  });
});
