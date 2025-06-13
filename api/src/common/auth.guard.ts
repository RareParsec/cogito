import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import admin from 'src/config/adminSDK';
import { PrismaService } from './prisma.service';
import { Prisma } from 'generated/prisma';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  private allowGuest(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    request.user = null;
    return true;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    );

    const request = context.switchToHttp().getRequest();
    const token = request.headers['authorization']?.split(`Bearer `)[1];

    try {
      if (!token) throw new UnauthorizedException('Sign in to continue.');

      const decodedToken = await admin.auth().verifyIdToken(token);

      if (!decodedToken)
        throw new UnauthorizedException('Sign in to continue.');

      if (context.getClass().name !== 'AuthController') {
        const dbUser = await this.prisma.user.findUnique({
          where: { id: decodedToken.uid },
        });

        if (!dbUser) {
          throw new UnauthorizedException(
            'Registeration invalid. Sign in again.',
          );
        }
      }

      request.user = decodedToken;
    } catch (error) {
      if (isPublic) return this.allowGuest(context);

      if (error instanceof HttpException) throw error;
      if (error.code === 'auth/id-token-expired') {
        throw new UnauthorizedException(
          'Session expired. Please sign in again.',
        );
      }
      console.log(error);

      throw new UnauthorizedException('Invalid token. Sign in to continue.');
    }

    return true;
  }
}
