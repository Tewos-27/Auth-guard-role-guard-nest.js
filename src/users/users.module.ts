import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '../prisma/prisma.service'; // Import PrismaService

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService], // Provide PrismaService here
})
export class UsersModule {}