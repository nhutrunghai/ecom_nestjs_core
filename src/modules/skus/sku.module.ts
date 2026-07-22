import { Module } from '@nestjs/common';
import { SkuController } from './sku.controller';
import { SkuRepository } from './sku.repo';
import { SkuService } from './sku.service';

@Module({
  controllers: [SkuController],
  providers: [SkuService, SkuRepository],
})
export class SkuModule {}
