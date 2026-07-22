import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import type { RequestUser } from 'src/shared/types/jwt-token.type';
import {
  CreateReviewDto,
  DeleteReviewResponseDto,
  ReviewListQueryDto,
  ReviewListResponseDto,
  ReviewResponseDto,
  UpdateReviewDto,
} from './dto/review.dto';
import { ReviewService } from './review.service';

@Controller()
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get('products/:productId/reviews')
  @ZodSerializerDto(ReviewListResponseDto)
  findAll(
    @Param('productId', ParseIntPipe) productId: number,
    @Query() query: ReviewListQueryDto,
  ) {
    return this.reviewService.findAll(productId, query);
  }

  @Post('orders/:orderId/products/:productId/reviews')
  @UseGuards(JwtAuthGuard)
  @ZodSerializerDto(ReviewResponseDto)
  create(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() body: CreateReviewDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.reviewService.create(orderId, productId, user.sub, body);
  }

  @Put('reviews/:reviewId')
  @UseGuards(JwtAuthGuard)
  @ZodSerializerDto(ReviewResponseDto)
  update(
    @Param('reviewId', ParseIntPipe) reviewId: number,
    @Body() body: UpdateReviewDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.reviewService.update(reviewId, user.sub, body);
  }

  @Delete('reviews/:reviewId')
  @UseGuards(JwtAuthGuard)
  @ZodSerializerDto(DeleteReviewResponseDto)
  delete(
    @Param('reviewId', ParseIntPipe) reviewId: number,
    @CurrentUser() user: RequestUser,
  ) {
    return this.reviewService.delete(reviewId, user.sub);
  }
}
