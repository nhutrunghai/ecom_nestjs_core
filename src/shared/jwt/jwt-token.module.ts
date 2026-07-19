import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PermissionGuard } from '../guards/permission.guard';
import { RolesGuard } from '../guards/roles.guard';
import { JwtTokenService } from './jwt-token.service';

@Module({
  imports: [JwtModule.register({})],
  providers: [JwtTokenService, JwtAuthGuard, RolesGuard, PermissionGuard],
  exports: [JwtTokenService, JwtAuthGuard, RolesGuard, PermissionGuard],
})
export class JwtTokenModule {}
