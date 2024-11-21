import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  DefaultStatus,
  DeleteDto,
  GetOneDto,
  LanguageRequestDto,
  ListQueryDto,
} from 'types/global';
import { PrismaService } from '../prisma/prisma.service';
import { createPagination } from 'src/common/helper/pagination.helper';
import { UserCreateDto, UserInterfaces, UserUpdateDto } from 'types/user/user';
import { RoleService } from '../role/role.service';
import * as bcrypt from 'bcrypt';
import { UserLogInDto } from 'types/user/user/dto/log-in-user.dto';
import { JwtService } from '@nestjs/jwt';
import { CheckUserPermissionDto } from 'types/user/user/dto/check-permission.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly roleService: RoleService,
    private readonly jwtService: JwtService
  ) {}

  async logIn(data: UserLogInDto): Promise<UserInterfaces.Response> {
    const user = await this.prisma.user.findUnique({
      where: { phoneNumber: data.phoneNumber },
      include: {
        role: {
          include: {
            RolePermission: true,
          },
        },
      },
    });

    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async checkPermission(data: CheckUserPermissionDto): Promise<boolean> {
    const { userId, roleId, method, path } = data;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { roleId: true },
    });

    if (!user || user.roleId !== roleId) {
      return false;
    }

    const permission = await this.prisma.rolePermission.findFirst({
      where: {
        roleId,
        path,
        permission: method,
        status: DefaultStatus.ACTIVE,
      },
    });

    return !!permission;
  }

  async create(data: UserCreateDto): Promise<UserInterfaces.Response> {
    const role = await this.roleService.findOne({
      id: data.roleId,
    });

    const user = await this.prisma.user.create({
      data: {
        fullName: data.fullName,
        phoneNumber: data.phoneNumber, // add formatter
        password: await bcrypt.hash(data.password, 10),
        roleId: role.id,
        numericId: data.numericId,
      },
    });

    return user;
  }

  async findAll(
    data: LanguageRequestDto
  ): Promise<UserInterfaces.ResponseWithoutPagination> {
    const user = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return {
      data: user,
      totalDocs: user.length,
    };
  }

  async findAllByPagination(
    data: ListQueryDto
  ): Promise<UserInterfaces.ResponseWithPagination> {
    const where: any = { status: DefaultStatus.ACTIVE };
    if (data.search) {
      where.name = {
        contains: data.search,
      };
    }
    const count = await this.prisma.user.count({
      where,
    });

    const pagination = createPagination({
      count,
      page: data.page,
      perPage: data.limit,
    });

    const user = await this.prisma.user.findMany({
      where: {
        status: DefaultStatus.ACTIVE,
      },
      orderBy: { createdAt: 'desc' },
      take: pagination.take,
      skip: pagination.skip,
    });

    return {
      data: user,
      totalPage: pagination.totalPage,
      totalDocs: count,
    };
  }

  async findOne(data: GetOneDto): Promise<UserInterfaces.Response> {
    const user = await this.prisma.user.findFirst({
      where: {
        id: data.id,
        status: DefaultStatus.ACTIVE,
      },
    });

    if (!user) {
      throw new NotFoundException('User is not found');
    }

    return user;
  }

  async update(data: UserUpdateDto): Promise<UserInterfaces.Response> {
    const user = await this.findOne({ id: data.id });

    if (data.roleId) {
      await this.roleService.findOne({ id: data.roleId });
    }

    return await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        fullName: data.fullName,
        phoneNumber: data.phoneNumber, // add formatter
        // password: await bcrypt.hash(data.password, 10),
        roleId: data.roleId,
        numericId: data.numericId,
      },
    });
  }

  async remove(data: DeleteDto): Promise<UserInterfaces.Response> {
    if (data.delete) {
      return await this.prisma.user.delete({
        where: { id: data.id },
      });
    }

    return await this.prisma.user.update({
      where: { id: data.id, status: DefaultStatus.ACTIVE },
      data: { status: DefaultStatus.INACTIVE },
    });
  }

  async restore(data: GetOneDto): Promise<UserInterfaces.Response> {
    return this.prisma.user.update({
      where: { id: data.id, status: DefaultStatus.INACTIVE },
      data: { status: DefaultStatus.ACTIVE },
    });
  }
}
