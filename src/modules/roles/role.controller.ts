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
  CreateRoleDto,
  DeleteRoleResponseDto,
  RoleResponseDto,
  UpdateRoleDto,
} from './dto/role.dto';
import { RoleService } from './role.service';

@Controller('roles')
@UseGuards(JwtAuthGuard)
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
