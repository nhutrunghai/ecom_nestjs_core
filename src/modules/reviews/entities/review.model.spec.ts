import { MediaType } from '../../../../generated/prisma/enums';
import { CreateReviewBodySchema, UpdateReviewBodySchema } from './review.model';

describe('Review schemas', () => {
  it('accepts a valid review', () => {
    expect(
      CreateReviewBodySchema.safeParse({
        content: 'Good product',
        rating: 5,
        medias: [
          { url: 'https://example.com/review.jpg', type: MediaType.IMAGE },
        ],
      }).success,
    ).toBe(true);
  });

  it('rejects ratings outside the 1-5 range', () => {
    expect(
      CreateReviewBodySchema.safeParse({ content: 'Bad', rating: 0 }).success,
    ).toBe(false);
  });

  it('rejects an empty update', () => {
    expect(UpdateReviewBodySchema.safeParse({}).success).toBe(false);
  });
});
