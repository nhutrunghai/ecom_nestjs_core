import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './database/prisma.module';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import { validateEnv } from './config/env.config';
import { SharedModule } from './shared/shared.module';
import { AuthModule } from './modules/auth/auth.module';
import { LanguageModule } from './modules/languages/language.module';
import { PermissionModule } from './modules/permissions/permission.module';
import { RoleModule } from './modules/roles/role.module';
import { ProfileModule } from './modules/profile/profile.module';
import { UserModule } from './modules/users/user.module';
import { ProductModule } from './modules/products/product.module';
import { BrandModule } from './modules/brands/brand.module';
import { CategoryModule } from './modules/categories/category.module';
import { SkuModule } from './modules/skus/sku.module';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      load: [appConfig, databaseConfig, jwtConfig],
    }),
    PrismaModule,
    SharedModule,
    AuthModule,
    LanguageModule,
    PermissionModule,
    RoleModule,
    ProfileModule,
    UserModule,
    ProductModule,
    BrandModule,
    CategoryModule,
    SkuModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
  ],
})
export class AppModule {}
