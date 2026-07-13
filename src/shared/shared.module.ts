import { Global, Module } from '@nestjs/common';
import { HashingModule } from './hashings/hashing.module';
import { JwtTokenModule } from './jwt/jwt-token.module';

@Global()
@Module({
  imports: [HashingModule, JwtTokenModule],
  exports: [HashingModule, JwtTokenModule],
})
export class SharedModule {}
