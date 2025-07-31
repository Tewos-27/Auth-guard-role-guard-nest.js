// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from '../prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config'; // Import ConfigModule and ConfigService
import { JwtStrategy } from './jwt.strategy'; // We'll create this next

@Module({
  imports: [
    ConfigModule, // Import ConfigModule to access environment variables
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule], // Import ConfigModule here as well
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '60m' }, // Token expires in 60 minutes
      }),
      inject: [ConfigService], // Inject ConfigService
    }),

  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, JwtStrategy], // Add PrismaService and JwtStrategy here
  exports: [AuthService, JwtModule, PassportModule], // Export for use in other modules if needed
})
export class AuthModule {}