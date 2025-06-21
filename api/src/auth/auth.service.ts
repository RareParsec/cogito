import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async continueWithGoogle(user: DecodedIdToken) {
    try {
      const userToReturn = await this.prisma.$transaction(async (tx) => {
        const userKey = parseInt(
          user.uid.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12),
          36,
        );

        await tx.$executeRawUnsafe(`SELECT pg_advisory_xact_lock(${userKey})`);

        const foundUser = await this.prisma.user.findFirst({
          where: {
            id: user.uid,
          },
        });

        if (foundUser) {
          return foundUser;
        } else {
          return await this.createUser(user, tx);
        }
      });

      return userToReturn;
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Trouble signing in. Try again?');
    }
  }

  private async createUser(user: DecodedIdToken, tx: Prisma.TransactionClient) {
    try {
      if (!user.email) {
        throw new BadRequestException('Please provide an email to continue!');
      }

      const createdUser = await tx.user.create({
        data: {
          id: user.uid,
          email: user.email,
        },
      });

      return createdUser;
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        'Trouble creating account. Try again?',
      );
    }
  }

  // private async signIn(user: DecodedIdToken) {
  //   try {
  //     const foundUser = await this.prisma.user.findUnique({
  //       where: { id: user.uid },
  //     });
  //     if (!foundUser) {
  //       throw new NotFoundException('User not found...');
  //     }
  //     return foundUser;
  //   } catch (error) {
  //     if (error instanceof HttpException) throw error;
  //     throw new InternalServerErrorException('Error signing in...');
  //   }
  // }
}
