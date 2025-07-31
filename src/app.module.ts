import { Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma/prisma.service'; // Corrected path
import { ConfigModule } from '@nestjs/config'; // Import ConfigModule
import { APP_PIPE } from '@nestjs/core'; // Import APP_PIPE
import { UsersModule } from './users/users.module'; // Import UsersModule

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigModule available globally
    }),
    AuthModule,
    UsersModule, // Add UsersModule here
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService, // Provide PrismaService globally
    {
      provide: APP_PIPE, // Provide global validation pipe
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}

