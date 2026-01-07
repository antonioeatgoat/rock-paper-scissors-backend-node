import { Body, Controller, Post, Res } from '@nestjs/common';
import type { Response } from 'express';

import { AuthService } from '@/auth/auth.service';
import { RegisterDto } from '@/auth/dto/register.dto';

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
}
