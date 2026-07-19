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
import { RoleName } from 'src/shared/constants/role.constants';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import type { RequestUser } from 'src/shared/types/jwt-token.type';
import {
  CreateRoleDto,
  DeleteRoleResponseDto,
  RoleResponseDto,
  UpdateRoleDto,
} from './dto/role.dto';
import { RoleService } from './role.service';

@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.ADMIN)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  findAll() {
    return this.roleService.findAll();
  }

  @Get(':roleId')
  @ZodSerializerDto(RoleResponseDto)
  findById(@Param('roleId', ParseIntPipe) roleId: number) {
    return this.roleService.findById(roleId);
  }

  @Post()
  @ZodSerializerDto(RoleResponseDto)
  create(@Body() body: CreateRoleDto, @CurrentUser() user: RequestUser) {
    return this.roleService.create(body, user.sub);
  }

  @Put()
  @ZodSerializerDto(RoleResponseDto)
  update(@Body() body: UpdateRoleDto, @CurrentUser() user: RequestUser) {
    return this.roleService.update(body, user.sub);
  }

  @Delete(':roleId')
  @ZodSerializerDto(DeleteRoleResponseDto)
  delete(
    @Param('roleId', ParseIntPipe) roleId: number,
    @CurrentUser() user: RequestUser,
  ) {
    return this.roleService.delete(roleId, user.sub);
  }
}
