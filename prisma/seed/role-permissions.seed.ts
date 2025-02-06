import { PrismaClient } from '@prisma/client';
import { RolePermissionsData } from '../../types/seed';

const prisma = new PrismaClient();

export async function seedRolePermissions() {
  const permissions = RolePermissionsData;
  let counter = 0;

  for (const permission of permissions) {
    const role = await prisma.role.findFirst({
      where: { name: permission.role },
    });

    const existingPermission = await prisma.rolePermission.findFirst({
      where: {
        roleId: role?.id,
        path: permission.path,
        permission: permission.permission,
      },
    });

    if (!existingPermission && role?.id) {
      const createdPermission = await prisma.rolePermission.create({
        data: {
          roleId: role.id,
          permission: permission.permission,
          path: permission.path,
        },
      });

      console.log(
        `Created permission: ${createdPermission.permission}-${createdPermission.path} for role ${createdPermission.roleId}`
      );
      counter++;
    } else {
      console.log(
        `Permission ${permission.permission} - ${permission.path} for role ${permission.role} already exists.`
      );
    }
  }
  console.log(`Total created data: ${counter}`);
}
