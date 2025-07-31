// src/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service'; // Corrected path

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in environment variables.');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // Do not ignore token expiration
      secretOrKey: jwtSecret, // Ensure secretOrKey is not undefined
    });
  }

  async validate(payload: any) {
    console.log('--- JwtStrategy: validate method called ---');
    console.log('JWT Payload received:', payload); // Log the decoded JWT payload

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      console.log('User not found in DB for payload.sub:', payload.sub);
      throw new UnauthorizedException();
    }

    // Attach roles to the user object for later use in guards
    const roles = user.userRoles.map(ur => ur.role.name);
    console.log('User found in DB:', user.email);
    console.log('Roles extracted from DB for user:', roles); // Log roles from DB

    const userWithRoles = { userId: user.id, email: user.email, roles };
    console.log('User object passed to request (with roles):', userWithRoles); // Log what's being returned
    return userWithRoles;
  }
}