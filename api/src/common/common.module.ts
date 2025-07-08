import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { AuthModule } from 'src/auth/auth.module';

@Global()
@Module({
  imports: [AuthModule],
  providers: [PrismaService],
  exports: [PrismaService, AuthModule],
})
export class CommonModule {}
