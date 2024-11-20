import { Module } from '@nestjs/common';
import { RolePermissionController } from './role-permission.controller';
import { RolePermissionService } from './role-permission.service';
import { RoleModule } from '../role/role.module';
// import { PermissionModule } from '../permission/permission.module';

@Module({
  imports: [RoleModule /*, PermissionModule*/],
  controllers: [RolePermissionController],
  providers: [RolePermissionService],
  exports: [RolePermissionService],
})
export class RolePermissionModule {}
