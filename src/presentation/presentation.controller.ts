import { Controller, Get, Render } from '@nestjs/common';

@Controller()
export class PresentationController {
  @Get()
  @Render('index')
  showHome() {}
}
