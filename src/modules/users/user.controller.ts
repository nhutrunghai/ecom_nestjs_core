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
import { CheckPermission } from 'src/shared/decorators/check-permission.decorator';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { PermissionGuard } from 'src/shared/guards/permission.guard';
import type { RequestUser } from 'src/shared/types/jwt-token.type';
import {
  CreateUserDto,
  DeleteUserResponseDto,
  UpdateUserDto,
  UserResponseDto,
} from './dto/user.dto';
import { UserService } from './user.service';

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionGuard)
@CheckPermission()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ZodSerializerDto([UserResponseDto])
  findAll() {
    return this.userService.findAll();
  }

  @Get(':userId')
  @ZodSerializerDto(UserResponseDto)
  findById(@Param('userId', ParseIntPipe) userId: number) {
    return this.userService.findById(userId);
  }

  @Post()
  @ZodSerializerDto(UserResponseDto)
  create(@Body() body: CreateUserDto, @CurrentUser() user: RequestUser) {
    return this.userService.create(body, user.sub);
  }

  @Put(':userId')
  @ZodSerializerDto(UserResponseDto)
  update(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() body: UpdateUserDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.userService.update(userId, body, user.sub);
  }

  @Delete(':userId')
  @ZodSerializerDto(DeleteUserResponseDto)
  delete(
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser() user: RequestUser,
  ) {
    return this.userService.delete(userId, user.sub);
  }
}
