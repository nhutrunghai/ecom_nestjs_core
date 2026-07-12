import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { JwtTokenService } from './jwt-token.service';

@Module({
  imports: [JwtModule.register({})],
  providers: [JwtTokenService, JwtAuthGuard],
  exports: [JwtTokenService, JwtAuthGuard],
})
export class JwtTokenModule {}
