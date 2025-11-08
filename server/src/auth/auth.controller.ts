import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { type Request, type Response } from 'express';

import { toDto } from 'src/common/utils/to-dto';
import { UserDto } from 'src/users/dto/user.dto';

import { AuthService } from './auth.service';
import { AuthLoginDto } from './dto/auth-login.dto';
import { AuthGuard } from './guards/auth.guard';

@Controller({ path: 'auth' })
@ApiTags('Authentication')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiResponse({ status: 201, type: UserDto })
  @Post('login')
  async login(
    @Req() req: Request,
    @Body() payload: AuthLoginDto,
  ): Promise<UserDto> {
    const user = await this.authService.validate(
      payload.username,
      payload.password,
    );
    req.session.userId = user.id;

    return toDto(UserDto, user);
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  @HttpCode(200)
  logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const { session } = req;

    if (session) {
      session.destroy(() => {});
    }

    res.cookie('connect.sid', '', { maxAge: 0 });
  }
}
