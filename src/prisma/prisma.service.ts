// src/prisma/prisma.service.ts
import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  // This method is called by main.ts to register the shutdown hook.
  // The PrismaClient itself will handle the 'beforeExit' event when app.close() is called.
  async enableShutdownHooks(app: INestApplication) {
    
  }
}