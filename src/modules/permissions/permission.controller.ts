import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import type { RequestUser } from 'src/shared/types/jwt-token.type';
import {
  CreatePermissionDto,
  DeletePermissionResponseDto,
  PermissionResponseDto,
  UpdatePermissionDto,
} from './dto/permission.dto';
import { PermissionService } from './permission.service';

@Controller('permissions')
@UseGuards(JwtAuthGuard)
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get()
  findAll() {
    return this.permissionService.findAll();
  }

  @Get(':permissionId')
  @ZodSerializerDto(PermissionResponseDto)
  findById(@Param('permissionId', ParseIntPipe) permissionId: number) {
    return this.permissionService.findById(permissionId);
  }

  @Post()
  @ZodSerializerDto(PermissionResponseDto)
  create(@Body() body: CreatePermissionDto, @CurrentUser() user: RequestUser) {
    return this.permissionService.create(body, user.sub);
  }

  @Put()
  @ZodSerializerDto(PermissionResponseDto)
  update(@Body() body: UpdatePermissionDto, @CurrentUser() user: RequestUser) {
    return this.permissionService.update(body, user.sub);
  }

  @Delete(':permissionId')
  @ZodSerializerDto(DeletePermissionResponseDto)
  delete(
    @Param('permissionId', ParseIntPipe) permissionId: number,
    @CurrentUser() user: RequestUser,
  ) {
    return this.permissionService.delete(permissionId, user.sub);
  }
}
