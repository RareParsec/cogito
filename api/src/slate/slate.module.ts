import { Module } from '@nestjs/common';
import { SlateService } from './slate.service';
import { SlateController } from './slate.controller';

@Module({
  controllers: [SlateController],
  providers: [SlateService],
})
export class SlateModule {}
