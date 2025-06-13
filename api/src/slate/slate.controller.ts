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
  constructor(private readonly slateService: SlateService) {
    // Create, update, delete, shareable link
  }

  @Get('all')
  async getAllSlates(@Req() req: Request) {
    const user = req['user'] as DecodedIdToken;
    return await this.slateService.getAllSlates(user);
  }

  @Post('mark-shareable/:id')
  async markShareable(@Param('id') id: string, @Req() req: Request) {
    const user = req['user'] as DecodedIdToken;
    return await this.slateService.markShareable(id, user);
  }

  @Post('new')
  async createNewSlate(@Req() req: Request) {
    const user = req['user'] as DecodedIdToken;
    return await this.slateService.createNewSlate(user);
  }

  @Public()
  @Get(':id')
  async getSlate(@Param('id') id: string, @Req() req: Request) {
    const user = req['user'] as DecodedIdToken | null;
    return await this.slateService.getSlate(id, user);
  }

  @Post(':id')
  async updateSlate(
    @Param('id') id: string,
    @Req() req: Request,
    @Body('content') content: any,
  ) {
    console.log('content:', content);
    const user = req['user'] as DecodedIdToken;
    return await this.slateService.updateSlate(id, user, content);
  }

  @Delete(':id')
  async deleteSlate(@Param('id') id: string, @Req() req: Request) {
    const user = req['user'] as DecodedIdToken;
    return await this.slateService.deleteSlate(id, user);
  }
}
