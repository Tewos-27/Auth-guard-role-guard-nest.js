import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Corrected path

@Injectable()
export class UsersService { // Added export
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        createdAt: true,
        userRoles: {
          include: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        createdAt: true,
        userRoles: {
          include: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async assignRole(userId: string, roleName: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    let role = await this.prisma.role.findUnique({ where: { name: roleName } });
    if (!role) {
      // Create the role if it doesn't exist (e.g., 'admin')
      role = await this.prisma.role.create({ data: { name: roleName } });
    }

    // Check if the user already has this role
    const existingUserRole = await this.prisma.userRole.findUnique({
      where: {
        userId_roleId: {
          userId: userId,
          roleId: role.id,
        },
      },
    });

    if (existingUserRole) {
      return { message: `User ${userId} already has role ${roleName}` };
    }

    await this.prisma.userRole.create({
      data: {
        userId: userId,
        roleId: role.id,
      },
    });

    return { message: `Role '${roleName}' assigned to user ${userId}` };
  }

  async removeRole(userId: string, roleName: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const role = await this.prisma.role.findUnique({ where: { name: roleName } });
    if (!role) {
      throw new NotFoundException(`Role '${roleName}' not found`);
    }

    const userRole = await this.prisma.userRole.findUnique({
      where: {
        userId_roleId: {
          userId: userId,
          roleId: role.id,
        },
      },
    });

    if (!userRole) {
      return { message: `User ${userId} does not have role ${roleName}` };
    }

    await this.prisma.userRole.delete({
      where: {
        userId_roleId: {
          userId: userId,
          roleId: role.id,
        },
      },
    });

    return { message: `Role '${roleName}' removed from user ${userId}` };
  }
}
