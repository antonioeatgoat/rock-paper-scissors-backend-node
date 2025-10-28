import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  UseGuards,
  Request,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service';
import type { Response } from 'express';
import { jwtConstants } from './constants';
import { LoggedInGuard } from './guards/logged-in.guard';
import type { UserRequest } from './interfaces/user-request.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto, @Res() res: Response) {
    const token = this.authService.register(registerDto);

    // TODO improve cookie settings
    res.cookie(jwtConstants.cookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60, // 1 ora
    });

    res.status(200);
    return res.json({
      success: 'User registered.',
    });
  }

  // TODO Remove this
  @UseGuards(LoggedInGuard)
  @Get('profile')
  getProfile(@Request() req: UserRequest) {
    return {
      user_id: req.user_id,
    };
  }
}
