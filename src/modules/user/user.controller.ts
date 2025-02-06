import { Controller, Delete, Get, Patch, Post, Put } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserServiceCommands as Commands } from 'types/user/user/commands';
import { DeleteDto, GetOneDto, ListQueryDto } from 'types/global';
import { UserService } from './user.service';
import {
  UserCreateDto,
  UserInterfaces,
  UserUpdateDto,
  UserUpdateMeDto,
} from 'types/user/user';
import { UserLogInDto } from 'types/user/user/dto/log-in-user.dto';
import { CheckUserPermissionDto } from 'types/user/user/dto/check-permission.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('log-in')
  @MessagePattern({ cmd: Commands.LOG_IN })
  logIn(@Payload() data: UserLogInDto): Promise<UserInterfaces.Response> {
    return this.userService.logIn(data);
  }

  @Get('check-permission')
  @MessagePattern({ cmd: Commands.CHECK_PERMISSION })
  checkPermission(@Payload() data: CheckUserPermissionDto): Promise<boolean> {
    return this.userService.checkPermission(data);
  }

  @Post()
  @MessagePattern({ cmd: Commands.CREATE })
  create(@Payload() data: UserCreateDto): Promise<UserInterfaces.Response> {
    return this.userService.create(data);
  }

  @Get('all')
  @MessagePattern({ cmd: Commands.GET_ALL_LIST })
  findAll(
    @Payload() data: ListQueryDto
  ): Promise<UserInterfaces.ResponseWithoutPagination> {
    return this.userService.findAll(data);
  }

  @Get('by-id')
  @MessagePattern({ cmd: Commands.GET_BY_ID })
  findOne(@Payload() data: GetOneDto): Promise<UserInterfaces.Response> {
    return this.userService.findOne(data);
  }

  @Get('get-me')
  @MessagePattern({ cmd: Commands.GET_ME_BY_ID })
  findMe(@Payload() data: GetOneDto): Promise<UserInterfaces.Response> {
    return this.userService.findMe(data);
  }

  @Put('update-me')
  @MessagePattern({ cmd: Commands.UPDATE_ME_BY_ID })
  updateMe(@Payload() data: UserUpdateMeDto): Promise<UserInterfaces.Response> {
    return this.userService.updateMe(data);
  }

  @Put()
  @MessagePattern({ cmd: Commands.UPDATE })
  update(@Payload() data: UserUpdateDto): Promise<UserInterfaces.Response> {
    return this.userService.update(data);
  }

  @Delete()
  @MessagePattern({ cmd: Commands.DELETE })
  remove(@Payload() data: DeleteDto): Promise<UserInterfaces.Response> {
    return this.userService.remove(data);
  }

  @Patch()
  @MessagePattern({ cmd: Commands.RESTORE })
  restore(@Payload() data: GetOneDto): Promise<UserInterfaces.Response> {
    return this.userService.restore(data);
  }
}
