import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
// This is the main controller for the application
// It handles the root route and returns a greeting message
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
