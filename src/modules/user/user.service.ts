import {
  HttpException,
  HttpStatus,
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
import {
  ResendSmsCodeDto,
  UserCreateDto,
  UserInterfaces,
  UserUpdateDto,
  UserUpdateMeDto,
  VerifySmsCodeDto,
} from 'types/user/user';
import { RoleService } from '../role/role.service';
import * as bcrypt from 'bcrypt';
import { UserLogInDto } from 'types/user/user/dto/log-in-user.dto';
import { CheckUserPermissionDto } from 'types/user/user/dto/check-permission.dto';
import { generateNumber } from 'src/common/helper/generate-number.helper';
import { secondsSinceGivenTime } from 'src/common/helper/seconds-since-given-time.helper';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly roleService: RoleService
  ) {}

  async logIn(data: UserLogInDto): Promise<UserInterfaces.Response> {
    const user = await this.prisma.user.findUnique({
      where: { phoneNumber: data.phoneNumber, status: DefaultStatus.ACTIVE },
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
      where: { id: userId, status: DefaultStatus.ACTIVE },
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
    let numericId = data.numericId;

    if (!numericId) {
      numericId = generateNumber()?.toString();
    }

    const user = await this.prisma.user.create({
      data: {
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        password: await bcrypt.hash(data.password, 10),
        roleId: role.id,
        numericId: numericId,
      },
    });

    return user;
  }

  async createUser(
    data: UserCreateDto
  ): Promise<UserInterfaces.ResponseCreateUser> {
    const role = await this.roleService.findOne({
      id: data.roleId,
    });
    let numericId = data.numericId;

    if (!numericId) {
      numericId = generateNumber()?.toString();
    }

    const smsCode = await generateNumber();

    const user = await this.prisma.user.create({
      data: {
        fullName: data.fullName,
        phoneNumber: data.phoneNumber, // add formatter
        password: await bcrypt.hash(data.password, 10),
        roleId: role.id,
        numericId: numericId,
        smsCode: smsCode,
        otpDuration: new Date(),
        attempt: 1,
        status: DefaultStatus.INACTIVE,
      },
    });

    return {
      smsCode: smsCode,
      userId: user.id,
    };
  }

  async verifySmsCode(
    data: VerifySmsCodeDto
  ): Promise<UserInterfaces.Response> {
    const finduser = await this.prisma.user.findFirst({
      where: {
        id: data.userId,
      },
    });

    if (!finduser) {
      throw new NotFoundException('User not found');
    }

    const differenceSeconds = await secondsSinceGivenTime(finduser.otpDuration);

    if (differenceSeconds > 60) {
      throw new HttpException('Time is over', HttpStatus.BAD_REQUEST);
    }

    if (finduser.smsCode != +data.smsCode) {
      const updated = await this.prisma.user.update({
        where: { id: finduser.id },
        data: {
          attempt: finduser.attempt + 1,
        },
      });
      throw new HttpException('Code is not correct', HttpStatus.BAD_REQUEST);
    }

    const updated = await this.prisma.user.update({
      where: { id: finduser.id },
      data: {
        attempt: 0,
        status: DefaultStatus.ACTIVE,
      },
    });

    return finduser;
  }
  async resendSmsCode(
    data: ResendSmsCodeDto
  ): Promise<UserInterfaces.ResponseCreateUser> {
    const finduser = await this.prisma.user.findFirst({
      where: {
        id: data.userId,
      },
    });

    if (!finduser) {
      throw new HttpException('Not found user', HttpStatus.NOT_FOUND);
    }

    if (finduser.attempt > 3) {
      throw new HttpException('attempt is over', HttpStatus.BAD_REQUEST);
    }
    const smsCode = await generateNumber();
    const updated = await this.prisma.user.update({
      where: {
        id: finduser.id,
      },
      data: {
        smsCode: smsCode,
        attempt: finduser.attempt + 1,
        otpDuration: new Date(),
      },
    });

    return {
      userId: finduser.id,
      smsCode,
    };
  }

  async findAll(
    data: ListQueryDto
  ): Promise<UserInterfaces.ResponseWithPagination> {
    if (data.all) {
      const user = await this.prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        where: {
          ...(data.status !== 2
            ? {
                status: data.status,
              }
            : {}),
        },

        include: { role: true },
      });

      return {
        data: user,
        totalDocs: user.length,
        totalPage: 1,
      };
    }

    const where: any = {
      ...(data.status !== 2
        ? {
            status: data.status,
          }
        : {}),
    };
    if (data.search) {
      where.fullName = {
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
      where,
      orderBy: { createdAt: 'desc' },
      take: pagination.take,
      skip: pagination.skip,
      include: { role: true },
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
      },
      include: { role: true },
    });

    if (!user) {
      throw new NotFoundException('User is not found');
    }

    delete user.password;

    return user;
  }

  async findMe(data: GetOneDto): Promise<UserInterfaces.Response> {
    const user = await this.prisma.user.findFirst({
      where: {
        id: data.id,
        status: DefaultStatus.ACTIVE,
      },
      include: { role: true },
    });

    if (!user) {
      throw new NotFoundException('User is not found');
    }

    delete user.password;

    return user;
  }

  async findByStaffNumber(data: GetOneDto): Promise<UserInterfaces.Response> {
    const user = await this.prisma.user.findFirst({
      where: {
        numericId: data.id.toString(),
        status: DefaultStatus.ACTIVE,
      },
      include: { role: true },
    });

    if (!user) {
      throw new NotFoundException('User is not found');
    }

    delete user.password;

    return user;
  }

  async update(data: UserUpdateDto): Promise<UserInterfaces.Response> {
    const user = await this.prisma.user.findFirst({
      where: {
        id: data.id,
      },
      include: { role: true },
    });

    if (data.roleId) {
      await this.roleService.findOne({ id: data.roleId });
    }

    if (
      data.oldPassword &&
      data.newPassword &&
      (!user || !(await bcrypt.compare(data.oldPassword, user.password)))
    ) {
      throw new UnauthorizedException('Incorrect old password');
    }

    return await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        password:
          data.oldPassword && data.newPassword
            ? await bcrypt.hash(data.newPassword, 10)
            : user.password,
        roleId: data.roleId,
        numericId: data.numericId,
      },
    });
  }

  async updateMe(data: UserUpdateMeDto): Promise<UserInterfaces.Response> {
    const user = await this.prisma.user.findFirst({
      where: {
        id: data.id,
        status: DefaultStatus.ACTIVE,
      },
    });

    if (
      data.oldPassword &&
      data.newPassword &&
      (!user || !(await bcrypt.compare(data.oldPassword, user.password)))
    ) {
      throw new UnauthorizedException('Incorrect old password');
    }

    return await this.prisma.user.update({
      where: {
        id: user.id,
        status: DefaultStatus.ACTIVE,
      },
      data: {
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        password:
          data.oldPassword && data.newPassword
            ? await bcrypt.hash(data.newPassword, 10)
            : user.password,
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
