import { Global, Module } from '@nestjs/common';
import { HashingModule } from './hashing/hashing.module';

@Global()
@Module({
  imports: [HashingModule],
  exports: [HashingModule],
})
export class SharedModule {}
