import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  SetMetadata,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/common/prisma.service';
import { AuthGuard } from 'src/common/auth.guard';

@Controller('auth')
@UseGuards(AuthGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('continueWithGoogle')
  async continueWithGoogle(@Req() req: Request) {
    const user = req['user'];

    return await this.authService.continueWithGoogle(user);
  }

  // @Get('signIn')
  // async signIn(@Req() req: Request) {
  //   const user = req['user'];

  //   return await this.authService.signIn(user);
  // }

  // @Post('createUser')
  // async createUser(@Req() req: Request) {
  //   const user = req['user'];

  //   return await this.authService.createUser(user);
  // }
}
