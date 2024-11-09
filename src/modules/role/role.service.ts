import { Injectable, NotFoundException } from '@nestjs/common';
import {
  DefaultStatus,
  DeleteDto,
  GetOneDto,
  LanguageRequestDto,
  ListQueryDto,
} from 'types/global';
import { PrismaService } from '../prisma/prisma.service';
import { RoleCreateDto, RoleInterfaces, RoleUpdateDto } from 'types/user/role';
import { createPagination } from 'src/common/helper/pagination.helper';

@Injectable()
export class RoleService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: RoleCreateDto): Promise<RoleInterfaces.Response> {
    const role = await this.prisma.role.create({
      data: {
        name: data.name,
      },
    });
    return role;
  }

  async findAll(
    data: LanguageRequestDto
  ): Promise<RoleInterfaces.ResponseWithoutPagination> {
    const role = await this.prisma.role.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return {
      data: role,
      totalDocs: role.length,
    };
  }

  async findAllByPagination(
    data: ListQueryDto
  ): Promise<RoleInterfaces.ResponseWithPagination> {
    const where: any = { status: DefaultStatus.ACTIVE };
    if (data.search) {
      where.name = {
        contains: data.search,
      };
    }
    const count = await this.prisma.role.count({
      where,
    });

    const pagination = createPagination({
      count,
      page: data.page,
      perPage: data.limit,
    });

    const role = await this.prisma.role.findMany({
      where: {
        status: DefaultStatus.ACTIVE,
      },
      orderBy: { createdAt: 'desc' },
      take: pagination.take,
      skip: pagination.skip,
    });

    return {
      data: role,
      totalPage: pagination.totalPage,
      totalDocs: count,
    };
  }

  async findOne(data: GetOneDto): Promise<RoleInterfaces.Response> {
    const role = await this.prisma.role.findFirst({
      where: {
        id: data.id,
        status: DefaultStatus.ACTIVE,
      },
    });

    if (!role) {
      throw new NotFoundException('Main Organization is not found');
    }

    return role;
  }

  async update(data: RoleUpdateDto): Promise<RoleInterfaces.Response> {
    const role = await this.findOne({ id: data.id });

    return await this.prisma.role.update({
      where: {
        id: role.id,
      },
      data: {
        name: data.name,
      },
    });
  }

  async remove(data: DeleteDto): Promise<RoleInterfaces.Response> {
    if (data.delete) {
      return await this.prisma.role.delete({
        where: { id: data.id },
      });
    }

    return await this.prisma.role.update({
      where: { id: data.id, status: DefaultStatus.ACTIVE },
      data: { status: DefaultStatus.INACTIVE },
    });
  }

  async restore(data: GetOneDto): Promise<RoleInterfaces.Response> {
    return this.prisma.role.update({
      where: { id: data.id, status: DefaultStatus.INACTIVE },
      data: { status: DefaultStatus.ACTIVE },
    });
  }
}
