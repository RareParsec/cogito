import {
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import { Prisma } from 'generated/prisma';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class SlateService {
  constructor(private prisma: PrismaService) {}

  private async findSlateById(id: string) {
    const slate = await this.prisma.slate.findUnique({
      where: { id },
    });

    if (!slate) {
      throw new NotFoundException('Slate not found :(');
    }

    return slate;
  }

  async getAllSlates(user: DecodedIdToken) {
    try {
      const slates = await this.prisma.slate.findMany({
        where: {
          authorId: user.uid,
        },
        select: {
          id: true,
          name: true,
        },
      });

      return slates;
    } catch (e) {
      if (e instanceof HttpException) throw e;
      throw new InternalServerErrorException('Error fetching slates...');
    }
  }

  async getSlate(id: string, user: DecodedIdToken | null) {
    try {
      const slate = await this.findSlateById(id);

      if (slate.authorId !== user?.uid && !slate.shared) {
        throw new ForbiddenException(
          'You do not have permission to access this slate.',
        );
      }

      return slate;
    } catch (e) {
      if (e instanceof HttpException) throw e;
      throw new InternalServerErrorException('Error fetching slate...');
    }
  }

  async createNewSlate(user: DecodedIdToken) {
    try {
      const newSlate = await this.prisma.slate.create({
        data: {
          authorId: user.uid,
          name: 'New Slate',
          content: '',
        },
      });

      return newSlate;
    } catch (e) {
      if (e instanceof HttpException) throw e;
      throw new InternalServerErrorException('Error creating new slate...');
    }
  }

  async updateSlate(id: string, user: DecodedIdToken, content: any) {
    try {
      const slate = await this.findSlateById(id);

      if (slate.authorId !== user?.uid) {
        throw new ForbiddenException(
          'You do not have permission to update this slate.',
        );
      }

      return await this.prisma.slate.update({
        where: { id },
        data: { content },
      });
    } catch (e) {
      if (e instanceof HttpException) throw e;
      throw new InternalServerErrorException('Error updating slate...');
    }
  }

  async deleteSlate(id: string, user: DecodedIdToken) {
    try {
      const slate = await this.findSlateById(id);

      if (slate.authorId !== user.uid) {
        throw new ForbiddenException(
          'You do not have permission to delete this slate.',
        );
      }

      return await this.prisma.slate.delete({
        where: { id },
      });
    } catch (e) {
      if (e instanceof HttpException) throw e;
      throw new InternalServerErrorException('Error deleting slate...');
    }
  }

  async markShareable(id: string, user: DecodedIdToken) {
    try {
      const slate = await this.findSlateById(id);

      if (slate.authorId !== user.uid) {
        throw new ForbiddenException(
          'You do not have permission to generate a shareable link for this slate.',
        );
      }

      await this.prisma.slate.update({
        where: { id },
        data: { shared: true },
      });

      return { success: true };
    } catch (e) {
      if (e instanceof HttpException) throw e;
      throw new InternalServerErrorException(
        'Error generating shareable link...',
      );
    }
  }
}
