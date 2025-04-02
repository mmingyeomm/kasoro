import { Controller, Get } from '@nestjs/common';

@Controller()
export class UserController {
  constructor() {}

  @Get()
  getHello(): string {

    return ""
  }
}
