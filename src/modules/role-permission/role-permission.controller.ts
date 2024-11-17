import { Controller, Delete, Get, Patch, Post, Put } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RolePermissionServiceCommands as Commands } from 'types/user/role-permission/commands';
import {
  DeleteDto,
  GetOneDto,
  LanguageRequestDto,
  ListQueryDto,
} from 'types/global';
import { RolePermissionService } from './role-permission.service';
import { RolePermissionCreateDto, RolePermissionInterfaces, RolePermissionUpdateDto } from 'types/user/role-permission';

@Controller('role-permission')
export class RolePermissionController {
  constructor(private readonly rolePermissionService: RolePermissionService) { }

  @Post()
  @MessagePattern({ cmd: Commands.CREATE })
  create(@Payload() data: RolePermissionCreateDto): Promise<RolePermissionInterfaces.Response> {
    return this.rolePermissionService.create(data);
  }

  @Get('all')
  @MessagePattern({ cmd: Commands.GET_ALL_LIST })
  findAll(
    @Payload() data: LanguageRequestDto
  ): Promise<RolePermissionInterfaces.ResponseWithoutPagination> {
    return this.rolePermissionService.findAll(data);
  }

  @Get()
  @MessagePattern({ cmd: Commands.GET_LIST_BY_PAGINATION })
  findAllByPagination(
    @Payload() data: ListQueryDto
  ): Promise<RolePermissionInterfaces.ResponseWithPagination> {
    return this.rolePermissionService.findAllByPagination(data);
  }

  @Get('by-id')
  @MessagePattern({ cmd: Commands.GET_BY_ID })
  findOne(@Payload() data: GetOneDto): Promise<RolePermissionInterfaces.Response> {
    return this.rolePermissionService.findOne(data);
  }

  @Put()
  @MessagePattern({ cmd: Commands.UPDATE })
  update(@Payload() data: RolePermissionUpdateDto): Promise<RolePermissionInterfaces.Response> {
    return this.rolePermissionService.update(data);
  }

  @Delete()
  @MessagePattern({ cmd: Commands.DELETE })
  remove(@Payload() data: DeleteDto): Promise<RolePermissionInterfaces.Response> {
    return this.rolePermissionService.remove(data);
  }

  @Patch()
  @MessagePattern({ cmd: Commands.RESTORE })
  restore(@Payload() data: GetOneDto): Promise<RolePermissionInterfaces.Response> {
    return this.rolePermissionService.restore(data);
  }
}
