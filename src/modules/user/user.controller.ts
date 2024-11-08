import { Controller, Delete, Get, Patch, Post, Put } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserServiceCommands as Commands } from 'types/user/user/commands';
import {
  DeleteDto,
  GetOneDto,
  LanguageRequestDto,
  ListQueryDto,
} from 'types/global';
import { UserService } from './user.service';
import { UserCreateDto, UserInterfaces, UserUpdateDto } from 'types/user/user';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @MessagePattern({ cmd: Commands.CREATE })
  create(@Payload() data: UserCreateDto): Promise<UserInterfaces.Response> {
    return this.userService.create(data);
  }

  @Get('all')
  @MessagePattern({ cmd: Commands.GET_ALL_LIST })
  findAll(
    @Payload() data: LanguageRequestDto
  ): Promise<UserInterfaces.ResponseWithoutPagination> {
    return this.userService.findAll(data);
  }

  @Get()
  @MessagePattern({ cmd: Commands.GET_LIST_BY_PAGINATION })
  findAllByPagination(
    @Payload() data: ListQueryDto
  ): Promise<UserInterfaces.ResponseWithPagination> {
    return this.userService.findAllByPagination(data);
  }

  @Get('by-id')
  @MessagePattern({ cmd: Commands.GET_BY_ID })
  findOne(@Payload() data: GetOneDto): Promise<UserInterfaces.Response> {
    return this.userService.findOne(data);
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
