import { Module } from '@nestjs/common';
import { PermissionController } from './permission.controller';
import { PermissionRepository } from './permission.repo';
import { PermissionService } from './permission.service';

@Module({
  controllers: [PermissionController],
  providers: [PermissionService, PermissionRepository],
})
export class PermissionModule {}
