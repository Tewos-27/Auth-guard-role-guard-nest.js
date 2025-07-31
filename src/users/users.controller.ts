import { Controller, Get, Param, UseGuards, Patch, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard) // Apply JwtAuthGuard and RolesGuard globally to this controller
export class UsersController { // Added export
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('admin') // Only users with 'admin' role can access this
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles('admin', 'user') // Both admin and regular users can access their own profile (or admin any profile)
  findOne(@Param('id') id: string) {
    // In a real app, you'd add logic to ensure a user can only view their own profile unless they are admin
    return this.usersService.findOne(id);
  }

  @Patch(':id/assign-role')
  @Roles('admin') // Only admin can assign roles
  assignRole(@Param('id') userId: string, @Body('roleName') roleName: string) {
    return this.usersService.assignRole(userId, roleName);
  }

  @Patch(':id/remove-role')
  @Roles('admin') // Only admin can remove roles
  removeRole(@Param('id') userId: string, @Body('roleName') roleName: string) {
    return this.usersService.removeRole(userId, roleName);
  }
}
