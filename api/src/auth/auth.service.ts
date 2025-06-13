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
      const foundUser = await this.prisma.user.findFirst({
        where: {
          id: user.uid,
        },
      });

      if (foundUser) {
        // return await this.signIn(user);
        return foundUser;
      } else {
        return await this.createUser(user);
      }
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Error signing in with Google...');
    }
  }

  private async createUser(user: DecodedIdToken) {
    try {
      if (!user.email) {
        throw new BadRequestException('Email is required to create a user.');
      }

      const createdUser = await this.prisma.user.create({
        data: {
          id: user.uid,
          email: user.email,
        },
      });

      return createdUser;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Error creating user...');
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
