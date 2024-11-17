import { Injectable, NotFoundException } from '@nestjs/common';
import {
  DefaultStatus,
  DeleteDto,
  GetOneDto,
  LanguageRequestDto,
  ListQueryDto,
} from 'types/global';
import { PrismaService } from '../prisma/prisma.service';
import { createPagination } from 'src/common/helper/pagination.helper';
import { PermissionCreateDto, PermissionInterfaces, PermissionUpdateDto } from 'types/user/permission';
import { permission } from 'process';

@Injectable()
export class PermissionService {
  constructor(private readonly prisma: PrismaService) { }

  async create(data: PermissionCreateDto): Promise<PermissionInterfaces.Response> {
    const permission = await this.prisma.permission.create({
      data: {
        name: data.name,
        description: data.description
      },
    });
    return permission;
  }

  async findAll(
    data: LanguageRequestDto
  ): Promise<PermissionInterfaces.ResponseWithoutPagination> {
    const permission = await this.prisma.permission.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return {
      data: permission,
      totalDocs: permission.length,
    };
  }

  async findAllByPagination(
    data: ListQueryDto
  ): Promise<PermissionInterfaces.ResponseWithPagination> {
    const where: any = { status: DefaultStatus.ACTIVE };
    if (data.search) {
      where.name = {
        contains: data.search,
      };
    }
    const count = await this.prisma.permission.count({
      where,
    });

    const pagination = createPagination({
      count,
      page: data.page,
      perPage: data.limit,
    });

    const permission = await this.prisma.permission.findMany({
      where: {
        status: DefaultStatus.ACTIVE,
      },
      orderBy: { createdAt: 'desc' },
      take: pagination.take,
      skip: pagination.skip,
    });

    return {
      data: permission,
      totalPage: pagination.totalPage,
      totalDocs: count,
    };
  }

  async findOne(data: GetOneDto): Promise<PermissionInterfaces.Response> {
    const permission = await this.prisma.permission.findFirst({
      where: {
        id: data.id,
        status: DefaultStatus.ACTIVE,
      },
    });

    if (!permission) {
      throw new NotFoundException('Permission is not found');
    }

    return permission;
  }

  async update(data: PermissionUpdateDto): Promise<PermissionInterfaces.Response> {
    const permission = await this.findOne({ id: data.id });

    return await this.prisma.permission.update({
      where: {
        id: permission.id,
      },
      data: {
        name: data.name,
        description: data.description
      },
    });
  }

  async remove(data: DeleteDto): Promise<PermissionInterfaces.Response> {
    if (data.delete) {
      return await this.prisma.permission.delete({
        where: { id: data.id },
      });
    }

    return await this.prisma.permission.update({
      where: { id: data.id, status: DefaultStatus.ACTIVE },
      data: { status: DefaultStatus.INACTIVE },
    });
  }

  async restore(data: GetOneDto): Promise<PermissionInterfaces.Response> {
    return this.prisma.permission.update({
      where: { id: data.id, status: DefaultStatus.INACTIVE },
      data: { status: DefaultStatus.ACTIVE },
    });
  }
}
