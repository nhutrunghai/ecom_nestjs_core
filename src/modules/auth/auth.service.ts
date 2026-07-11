import { ConflictException, Injectable } from '@nestjs/common';
import { HashingService } from 'src/shared/hashing/hashing.service';
import { PrismaService } from 'src/database/prisma.service';
import { isPrismaErrorCode, PrismaErrorCode } from 'src/database/prisma-error.util';
import { RoleService } from './role.service';
import { RegisterBody } from './auth.dto';
@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly prismaService: PrismaService,
    private readonly roleService: RoleService
  ) {}
  async register(body: RegisterBody) {
    try {
      const hashedPassword = await this.hashingService.hash(body.password);
      const roleID = await this.roleService.getClientId();
      const user = await this.prismaService.user.create({
        data: {
          email: body.email,
          password: hashedPassword,
          name: body.name,
          phoneNumber: body.phoneNumber,
          roleId: roleID,
        },
        omit: {
          password: true
        }
      });
      return user;
    } catch (error) {
      if(isPrismaErrorCode(error, PrismaErrorCode.UniqueConstraintFailed)) {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }
}
