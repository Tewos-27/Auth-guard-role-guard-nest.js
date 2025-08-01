import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // We'll create this next
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}
// user registration method
  // This method will create a new user in the database and assign them a default role.
  async register(registerDto: RegisterDto) {
    const { email, password } = registerDto;

    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    // Assign a default 'user' role to new registrations
    let userRole = await this.prisma.role.findUnique({ where: { name: 'user' } });
    if (!userRole) {
      userRole = await this.prisma.role.create({ data: { name: 'user' } });
    }

    await this.prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: userRole.id,
      },
    });

    // For security, do not return the password
    const { password: _, ...result } = user;
    return result;
  }
// user login method
  // This method will validate the user's credentials and return a JWT token if successful.
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const roles = user.userRoles.map(ur => ur.role.name);

    const payload = { email: user.email, sub: user.id, roles };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
// validate user method
  // This method will check if a user exists by email and return their details without the password
  async validateUser(email: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user) {
      // For security, do not return the password
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
}
