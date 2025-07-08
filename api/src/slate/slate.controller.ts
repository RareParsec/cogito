import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SlateService } from './slate.service';
import { AuthGuard } from 'src/common/auth.guard';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import { Public } from 'src/common/public.decorator';

@Controller('slate')
@UseGuards(AuthGuard)
export class SlateController {
  constructor(private readonly slateService: SlateService) {}

  @Get('all')
  async getAllSlates(@Req() req: Request) {
    const user = req['user'] as DecodedIdToken;
    const guestToken = req['guestToken'] as string | null;

    return await this.slateService.getAllSlates(user, guestToken);
  }

  @Public()
  @Get(':id')
  async getSlate(@Param('id') id: string, @Req() req: Request) {
    const user = req['user'] as DecodedIdToken | null;
    const guestToken = req['guestToken'] as string | null;

    return await this.slateService.getSlate(id, user, guestToken);
  }

  //
  // @Get('guest-slate')
  // async getGuestSlate(@Req() req: Request) {
  //   const guestToken = (req.headers['x-guest-token'] || null) as string | null;
  //   console.log('Guest token:', guestToken);
  //   return await this.slateService.getGuestSlate(guestToken);
  // }

  @Post('new')
  async createNewSlate(@Req() req: Request) {
    const user = req['user'] as DecodedIdToken;
    const guestToken = req['guestToken'] as string | null;

    return await this.slateService.createNewSlate(user, guestToken);
  }

  @Post('transfer-guest-slate')
  async transferGuestSlate(@Req() req: Request) {
    const user = req['user'] as DecodedIdToken;
    const guestToken = req['guestToken'] as string | null;
    console.log(user);

    return await this.slateService.transferGuestSlate(user, guestToken);
  }

  @Post('share/:id')
  async toggleShare(@Param('id') id: string, @Req() req: Request) {
    const user = req['user'] as DecodedIdToken;
    const guestToken = req['guestToken'] as string | null;

    return await this.slateService.toggleShare(id, user, guestToken);
  }

  @Post('rename/:id')
  async renameSlate(
    @Param('id') id: string,
    @Req() req: Request,
    @Body('name') name: string,
  ) {
    const user = req['user'] as DecodedIdToken;
    const guestToken = req['guestToken'] as string | null;

    return await this.slateService.renameSlate(id, user, guestToken, name);
  }

  @Post(':id')
  async updateSlate(
    @Param('id') id: string,
    @Req() req: Request,
    @Body('content') content: any,
  ) {
    const user = req['user'] as DecodedIdToken;
    const guestToken = req['guestToken'] as string | null;

    return await this.slateService.updateSlate(id, user, guestToken, content);
  }

  //
  // @Post('guest-new')
  // async createNewGuestSlate(@Req() req: Request) {
  //   const guestToken = (req.headers['x-guest-token'] || null) as string | null;

  //   return await this.slateService.createNewGuestSlate(guestToken);
  // }

  //
  // @Post('guest-update/:id')
  // async updateGuestSlate(
  //   @Param('id') id: string,
  //   @Req() req: Request,
  //   @Body('content') content: any,
  // ) {
  //   const guestToken = (req.headers['x-guest-token'] || null) as string | null;
  //   return await this.slateService.updateGuestSlate(id, guestToken, content);
  // }

  @Delete(':id')
  async deleteSlate(@Param('id') id: string, @Req() req: Request) {
    const user = req['user'] as DecodedIdToken;
    const guestToken = req['guestToken'] as string | null;

    return await this.slateService.deleteSlate(id, user, guestToken);
  }
}
