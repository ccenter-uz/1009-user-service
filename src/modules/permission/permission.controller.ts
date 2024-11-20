// import { Controller, Delete, Get, Patch, Post, Put } from '@nestjs/common';
// import { MessagePattern, Payload } from '@nestjs/microservices';
// import { PermissionServiceCommands as Commands } from 'types/user/permission/commands';
// import {
//   DeleteDto,
//   GetOneDto,
//   LanguageRequestDto,
//   ListQueryDto,
// } from 'types/global';
// import { PermissionCreateDto, PermissionInterfaces, PermissionUpdateDto } from 'types/user/permission';
// import { PermissionService } from './permission.service';

// @Controller('permission')
// export class PermissionController {
//   constructor(private readonly permissionService: PermissionService) { }

//   @Post()
//   @MessagePattern({ cmd: Commands.CREATE })
//   create(@Payload() data: PermissionCreateDto): Promise<PermissionInterfaces.Response> {
//     return this.permissionService.create(data);
//   }

//   @Get('all')
//   @MessagePattern({ cmd: Commands.GET_ALL_LIST })
//   findAll(
//     @Payload() data: LanguageRequestDto
//   ): Promise<PermissionInterfaces.ResponseWithoutPagination> {
//     return this.permissionService.findAll(data);
//   }

//   @Get()
//   @MessagePattern({ cmd: Commands.GET_LIST_BY_PAGINATION })
//   findAllByPagination(
//     @Payload() data: ListQueryDto
//   ): Promise<PermissionInterfaces.ResponseWithPagination> {
//     return this.permissionService.findAllByPagination(data);
//   }

//   @Get('by-id')
//   @MessagePattern({ cmd: Commands.GET_BY_ID })
//   findOne(@Payload() data: GetOneDto): Promise<PermissionInterfaces.Response> {
//     return this.permissionService.findOne(data);
//   }

//   @Put()
//   @MessagePattern({ cmd: Commands.UPDATE })
//   update(@Payload() data: PermissionUpdateDto): Promise<PermissionInterfaces.Response> {
//     return this.permissionService.update(data);
//   }

//   @Delete()
//   @MessagePattern({ cmd: Commands.DELETE })
//   remove(@Payload() data: DeleteDto): Promise<PermissionInterfaces.Response> {
//     return this.permissionService.remove(data);
//   }

//   @Patch()
//   @MessagePattern({ cmd: Commands.RESTORE })
//   restore(@Payload() data: GetOneDto): Promise<PermissionInterfaces.Response> {
//     return this.permissionService.restore(data);
//   }
// }
