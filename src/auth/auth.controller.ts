import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';

import { User } from '@/users/user/user';

import { User as UserDecorator } from './decorators/user.decorator';
import { RegisterDto } from './dto/register.dto';
import { AuthenticatedGuard } from './guards/authenticated.guard';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Res() res: Response) {
    await this.authService.register(res, registerDto);

    res.status(200);
    return res.json({
      success: 'User registered.',
    });
  }

  // TODO Remove this
  @UseGuards(AuthenticatedGuard)
  @Get('profile')
  getProfile(@UserDecorator() user: User) {
    return {
      user: user,
    };
  }
}
