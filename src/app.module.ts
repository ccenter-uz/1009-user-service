import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  appConfig,
  dbConfig,
  rabbitConfig,
} from './common/config/configuration';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionFilter } from './common/filter/all-exception.filter';
import { PrismaModule } from './modules/prisma/prisma.module';
import { RoleModule } from './modules/role/role.module';
import { UserModule } from './modules/user/user.module';
// import { PermissionModule } from './modules/permission/permission.module';
import { RolePermissionModule } from './modules/role-permission/role-permission.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, dbConfig, rabbitConfig],
    }),
    PrismaModule,
    RoleModule,
    UserModule,
    // PermissionModule,
    RolePermissionModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionFilter,
    },
  ],
})
export class AppModule { }
