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
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
    private readonly authService: AuthService, // Assuming AuthService is used for user-related operations
  ) {}

  private allowGuest(context: ExecutionContext) {
    console.log('Allowing guest access');
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
    const guestToken = request.headers['x-guest-token'] as string | null;
    request.guestToken = guestToken || null;

    const token = request.headers['authorization']?.split(`Bearer `)[1];

    try {
      if (!token)
        throw new UnauthorizedException('Please sign in to continue!');

      const decodedToken = await admin.auth().verifyIdToken(token);
      if (!decodedToken)
        throw new UnauthorizedException('Please sign in to continue!');

      if (context.getClass().name !== 'AuthController') {
        try {
          const dbUser =
            await this.authService.continueWithGoogle(decodedToken);
          if (!dbUser)
            throw new UnauthorizedException(
              'Something went wrong. Please sign in again!',
            );
        } catch (error) {
          throw new UnauthorizedException(
            'Something went wrong. Please sign in again!',
          );
        }
      }

      console.log('not allowing guest', decodedToken);
      request.user = decodedToken;
    } catch (error) {
      if (isPublic || guestToken) return this.allowGuest(context);

      if (error instanceof HttpException) throw error;

      if (error.code === 'auth/id-token-expired') {
        throw new UnauthorizedException(
          'Your session expired. Please sign in again!',
        );
      }

      console.log(error);
      throw new UnauthorizedException('Please sign in to continue!');
    }

    return true;
  }
}
