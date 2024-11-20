import { Injectable, NotFoundException } from '@nestjs/common';
import {
  DefaultStatus,
  DeleteDto,
  GetOneDto,
  LanguageRequestDto,
  ListQueryDto,
  PermissionsEnum,
} from 'types/global';
import { PrismaService } from '../prisma/prisma.service';
import { createPagination } from 'src/common/helper/pagination.helper';
import { RoleService } from '../role/role.service';
// import { PermissionService } from '../permission/permission.service';
import {
  RolePermissionCreateDto,
  RolePermissionInterfaces,
  RolePermissionUpdateDto,
} from 'types/user/role-permission';

@Injectable()
export class RolePermissionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly roleService: RoleService
    // private readonly permissionService: PermissionService
  ) {}

  async create(
    data: RolePermissionCreateDto
  ): Promise<RolePermissionInterfaces.Response> {
    const role = await this.roleService.findOne({
      id: data.roleId,
    });

    // const permission = await this.permissionService.findOne({
    //   id: data.permissionId,
    // });

    const rolePermission = await this.prisma.rolePermission.create({
      data: {
        roleId: role.id,
        permission: data.permission,
        path: data.path,
      },
    });

    return rolePermission;
  }

  async findAll(
    data: LanguageRequestDto
  ): Promise<RolePermissionInterfaces.ResponseWithoutPagination> {
    const rolePermission = await this.prisma.rolePermission.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return {
      data: rolePermission,
      totalDocs: rolePermission.length,
    };
  }

  async findAllByPagination(
    data: ListQueryDto
  ): Promise<RolePermissionInterfaces.ResponseWithPagination> {
    const where: any = { status: DefaultStatus.ACTIVE };
    if (data.search) {
      where.name = {
        contains: data.search,
      };
    }
    const count = await this.prisma.rolePermission.count({
      where,
    });

    const pagination = createPagination({
      count,
      page: data.page,
      perPage: data.limit,
    });

    const rolePermission = await this.prisma.rolePermission.findMany({
      where: {
        status: DefaultStatus.ACTIVE,
      },
      orderBy: { createdAt: 'desc' },
      take: pagination.take,
      skip: pagination.skip,
    });

    return {
      data: rolePermission,
      totalPage: pagination.totalPage,
      totalDocs: count,
    };
  }

  async findOne(data: GetOneDto): Promise<RolePermissionInterfaces.Response> {
    const rolePermission = await this.prisma.rolePermission.findFirst({
      where: {
        id: data.id,
        status: DefaultStatus.ACTIVE,
      },
    });

    if (!rolePermission) {
      throw new NotFoundException('Role permission is not found');
    }

    return rolePermission;
  }

  async update(
    data: RolePermissionUpdateDto
  ): Promise<RolePermissionInterfaces.Response> {
    const rolePermission = await this.findOne({ id: data.id });

    if (data.roleId) {
      await this.roleService.findOne({ id: data.roleId });
    }

    // if (data.permissionId) {
    //   await this.permissionService.findOne({ id: data.roleId });
    // }

    return await this.prisma.rolePermission.update({
      where: {
        id: rolePermission.id,
      },
      data: {
        roleId: data.roleId,
        permission: data.permission,
      },
    });
  }

  async remove(data: DeleteDto): Promise<RolePermissionInterfaces.Response> {
    if (data.delete) {
      return await this.prisma.rolePermission.delete({
        where: { id: data.id },
      });
    }

    return await this.prisma.rolePermission.update({
      where: { id: data.id, status: DefaultStatus.ACTIVE },
      data: { status: DefaultStatus.INACTIVE },
    });
  }

  async restore(data: GetOneDto): Promise<RolePermissionInterfaces.Response> {
    return this.prisma.rolePermission.update({
      where: { id: data.id, status: DefaultStatus.INACTIVE },
      data: { status: DefaultStatus.ACTIVE },
    });
  }
}
