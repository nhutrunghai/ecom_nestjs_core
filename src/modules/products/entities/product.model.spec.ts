import {
  CreateProductBodySchema,
  UpdateProductBodySchema,
} from './product.model';

const validProduct = {
  name: 'iPhone 17',
  basePrice: 1000,
  virtualPrice: 1200,
  brandId: 1,
  images: ['https://example.com/product.jpg'],
  variants: [
    {
      name: 'Color',
      options: ['Black', 'White'],
    },
  ],
  categoryIds: [1, 2],
  skus: [
    {
      value: 'BLACK-128GB',
      price: 1000,
      stock: 10,
      image: 'https://example.com/black.jpg',
    },
  ],
  translations: [
    {
      languageId: 'vi',
      name: 'Điện thoại iPhone 17',
      description: 'Mô tả sản phẩm',
    },
  ],
};

describe('Product schemas', () => {
  it('accepts a valid create product payload', () => {
    expect(CreateProductBodySchema.safeParse(validProduct).success).toBe(true);
  });

  it('rejects virtual price lower than base price', () => {
    const result = CreateProductBodySchema.safeParse({
      ...validProduct,
      virtualPrice: 999,
    });

    expect(result.success).toBe(false);
  });

  it('rejects duplicate categories and SKU values', () => {
    const result = CreateProductBodySchema.safeParse({
      ...validProduct,
      categoryIds: [1, 1],
      skus: [validProduct.skus[0], validProduct.skus[0]],
    });

    expect(result.success).toBe(false);
  });

  it('rejects an empty update payload', () => {
    expect(UpdateProductBodySchema.safeParse({}).success).toBe(false);
  });
});
