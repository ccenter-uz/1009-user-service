import { Injectable } from '@nestjs/common';
import {
  MonitoringFilterDto,
  MonitoringInterfaces,
} from 'types/user/monitoring';
import { Roles } from 'types/global';
import { PrismaService } from '../prisma/prisma.service';
import { createPagination } from 'src/common/helper/pagination.helper';

@Injectable()
export class MonitoringService {
  constructor(private readonly prisma: PrismaService) {}

  // async create(
  //   data: MainOrganizationCreateDto
  // ): Promise<MainOrganizationInterfaces.Response> {
  //   // const mainOrganization = await this.prisma.mainOrganization
  //   const mainOrganization = await this.prisma.mainOrganization.create({
  //     data: {
  //       staffNumber: data.staffNumber,
  //       name: data.name,
  //     },
  //   });

  //   return mainOrganization;
  // }

  async findAll(
    data: MonitoringFilterDto
  ): Promise<MonitoringInterfaces.ResponseWithPagination> {
    if (data.all) {
      const monitoringData = await this.prisma.apiLogs.findMany({
        orderBy: { createdAt: 'desc' },
      });

      return {
        data: monitoringData,
        totalDocs: monitoringData.length,
        totalPage: 1,
      };
    }

    const where: any = {};

    if (data.role == Roles.OPERATOR) {
      // where.userNumericId = data.staffNumber;

      where.role = {
        in: [Roles.USER, Roles.OPERATOR],
      };
    }

    if (data.search) {
      where.userFullName = {
        contains: data.search,
        mode: 'insensitive',
      };
    }

    if (data.userId) {
      where.userId = data.userId;
    }

    const count = await this.prisma.apiLogs.count({
      where,
    });

    const pagination = createPagination({
      count,
      page: data.page,
      perPage: data.limit,
    });

    const monitoringData = await this.prisma.apiLogs.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: pagination.take,
      skip: pagination.skip,
    });

    return {
      data: monitoringData,
      totalPage: pagination.totalPage,
      totalDocs: count,
    };
  }
}
