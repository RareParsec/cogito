import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SlateModule } from './slate/slate.module';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [SlateModule, AuthModule, CommonModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
