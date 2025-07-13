import {
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import { Prisma, PrismaClient } from 'generated/prisma';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class SlateService {
  constructor(private prisma: PrismaService) {}

  async getAllSlates(
    user: DecodedIdToken | null,
    guestTokenReceived: string | null,
  ) {
    try {
      const slatesToReturn = await this.prisma.$transaction(async (tx) => {
        const key = (() => {
          let h = 0x811c9dc5;
          const str = user?.uid || guestTokenReceived || '';
          for (let i = 0; i < str.length; i++) {
            h ^= str.charCodeAt(i);
            h = Math.imul(h, 0x01000193);
          }
          return h >>> 0;
        })();

        await tx.$executeRawUnsafe(`SELECT pg_advisory_xact_lock(${key})`);

        let slates;

        if (user) {
          slates = await tx.slate.findMany({
            where: { authorId: user.uid },
            select: { id: true, name: true },
            orderBy: { updatedAt: 'desc' },
          });
        } else if (guestTokenReceived) {
          const slate = await tx.slate.findUnique({
            where: { guestToken: guestTokenReceived },
            select: { id: true, name: true },
          });
          slates = slate ? [slate] : [];
        } else {
          slates = [];
        }

        if (slates.length === 0) {
          try {
            const { id, name } = await this.createNewSlate(
              user,
              guestTokenReceived,
              tx,
            );

            slates.push({ id, name });
          } catch (e) {}
        }

        return slates;
      });
      return slatesToReturn;
    } catch (e) {
      console.error('Error fetching slates:', e);
      if (e instanceof HttpException) throw e;
      throw new InternalServerErrorException(
        'Oops! Trouble loading your slates. Try again?',
      );
    }
  }

  //
  // async getGuestSlate(guestTokenReceived?: string | null) {
  //   console.log('Received guest tokennnn:', guestTokenReceived);
  //   if (!guestTokenReceived) {
  //     throw new ForbiddenException(
  //       'Guest key is required to access a guest slate.',
  //     );
  //   }

  //   try {
  //     const slate = await this.prisma.slate.findUnique({
  //       where: { guestToken: guestTokenReceived },
  //     });

  //     if (!slate) {
  //       throw new NotFoundException('Guest slate not found.');
  //     }

  //     return slate;
  //   } catch (e) {
  //     if (e instanceof HttpException) throw e;
  //     throw new InternalServerErrorException('Error fetching slate...');
  //   }
  // }

  async getSlate(
    id: string,
    user: DecodedIdToken | null,
    guestTokenReceived: string | null,
  ) {
    try {
      const slate = await this.prisma.slate.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          content: true,
          authorId: true,
          guestToken: true,
          shared: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!slate) throw new NotFoundException('Slate not found!');
      const { guestToken, ...slateWOGuestToken } = slate;

      if (slate.authorId) {
        if (user && slate.authorId === user.uid) {
          return slateWOGuestToken;
        } else if (slate.shared) {
          return { ...slateWOGuestToken, viewing: true };
        } else {
          throw new ForbiddenException('This slate is private right now.');
        }
      } else if (slate.guestToken) {
        if (guestTokenReceived && guestTokenReceived === slate.guestToken) {
          return slateWOGuestToken;
        } else if (slate.shared) {
          return { ...slateWOGuestToken, viewing: true };
        } else {
          throw new ForbiddenException("You don't have access to this slate.");
        }
      } else {
        if (slate.shared) {
          return { ...slateWOGuestToken, viewing: true };
        }
        throw new ForbiddenException(
          'You need permission to access this slate.',
        );
      }
    } catch (e) {
      if (e instanceof HttpException) throw e;
      throw new InternalServerErrorException(
        'Trouble loading slate. Try again!',
      );
    }
  }

  async createNewSlate(
    user: DecodedIdToken | null,
    guestTokenReceived: string | null,
    tx: Prisma.TransactionClient | PrismaClient = this.prisma,
  ) {
    try {
      let existingSlateNames;
      if (user) {
        existingSlateNames = await tx.slate.findMany({
          where: { authorId: user.uid },
          select: { name: true },
        });
      } else if (guestTokenReceived) {
        existingSlateNames = await tx.slate.findMany({
          where: { guestToken: guestTokenReceived },
          select: { name: true },
        });

        if (existingSlateNames.length > 0) {
          throw new ForbiddenException(
            'You can only have one temporary slate! Sign in to create more.',
          );
        }
      } else {
        throw new ForbiddenException('Need to be logged in to create slate.');
      }

      const existingNamesSet = new Set(existingSlateNames.map((s) => s.name));

      let newName = 'New Slate';
      for (let i = 0; i <= existingSlateNames.length; i++) {
        const nameToTry = i === 0 ? 'New Slate' : `New Slate ${i}`;
        if (!existingNamesSet.has(nameToTry)) {
          newName = nameToTry;
          break;
        }
      }

      if (user) {
        const createdSlate = await tx.slate.create({
          data: {
            authorId: user.uid,
            name: newName,
            content: '',
          },
        });

        return createdSlate;
      } else if (guestTokenReceived) {
        const createdSlate = await tx.slate.create({
          data: {
            name: newName,
            content: '',
            guestToken: guestTokenReceived,
          },
        });

        return createdSlate;
      } else {
        throw new ForbiddenException('Need to be logged in to create slate.');
      }
    } catch (e) {
      if (e instanceof HttpException) throw e;
      throw new InternalServerErrorException(
        'Trouble creating slate. Try again?',
      );
    }
  }

  //
  // async createNewGuestSlate(guestTokenReceived?: string | null) {
  //   if (!guestTokenReceived) {
  //     throw new ForbiddenException(
  //       'Guest key is required to create a guest slate.',
  //     );
  //   }

  //   try {
  //     const newSlate = await this.prisma.slate.create({
  //       data: {
  //         name: 'New Slate',
  //         content: '',
  //         guestToken: guestTokenReceived,
  //       },
  //     });
  //     console.log('Created new guest slate:', newSlate);

  //     return newSlate;
  //   } catch (e) {
  //     if (e instanceof HttpException) throw e;
  //     throw new InternalServerErrorException(
  //       'Error creating new guest slate...',
  //     );
  //   }
  // }

  async transferGuestSlate(
    user: DecodedIdToken | null,
    guestTokenReceived: string | null,
  ) {
    try {
      if (!user) {
        throw new ForbiddenException('Please log in to claim this slate!');
      }
      if (!guestTokenReceived) {
        throw new ForbiddenException('Something went wrong. Please try again.');
      }

      const slate = await this.prisma.slate.findUnique({
        where: { guestToken: guestTokenReceived, authorId: null },
      });

      if (!slate) {
        throw new NotFoundException('Temporary slate not found.');
      }

      const updatedSlate = await this.prisma.slate.update({
        where: { guestToken: guestTokenReceived, authorId: null },
        data: { guestToken: null, authorId: user.uid },
      });

      return updatedSlate;
    } catch (e) {
      console.log(e);
      if (e instanceof HttpException) throw e;
      throw new InternalServerErrorException(
        'Trouble transferring slate. Try again!',
      );
    }
  }

  async toggleShare(
    id: string,
    user: DecodedIdToken | null,
    guestTokenReceived: string | null,
  ) {
    try {
      const slate = await this.prisma.slate.findUnique({
        where: { id },
        select: {
          id: true,
          authorId: true,
          guestToken: true,
          shared: true,
        },
      });

      if (!slate) {
        throw new NotFoundException('Slate not found!');
      }

      if (
        (user && slate.authorId && slate.authorId === user.uid) ||
        (guestTokenReceived &&
          slate.guestToken &&
          slate.guestToken === guestTokenReceived)
      ) {
        const updatedSlate = await this.prisma.slate.update({
          where: { id },
          data: { shared: !slate.shared },
        });
        return { success: true, shared: updatedSlate.shared };
      } else {
        throw new ForbiddenException(
          'Only the owner can change sharing settings.',
        );
      }
    } catch (e) {
      if (e instanceof HttpException) throw e;
      throw new InternalServerErrorException(
        'Trouble updating sharing. Try again?',
      );
    }
  }

  async renameSlate(
    id: string,
    user: DecodedIdToken | null,
    guestTokenReceived: string | null,
    name: string,
  ) {
    try {
      const slate = await this.prisma.slate.findUnique({
        where: { id },
        select: {
          id: true,
          authorId: true,
          guestToken: true,
        },
      });

      if (!slate) {
        throw new NotFoundException('Slate not found to rename!');
      }

      if (!name || name.trim() === '') {
        throw new ForbiddenException('Please give your slate a name!');
      }

      if (name.length > 100) {
        throw new ForbiddenException(
          'Name too long! Keep it under 100 characters.',
        );
      }

      if (
        (user && slate.authorId && slate.authorId === user.uid) ||
        (guestTokenReceived &&
          slate.guestToken &&
          slate.guestToken === guestTokenReceived)
      ) {
        const renamedSlate = await this.prisma.slate.update({
          where: { id },
          data: { name },
        });

        return {
          id: renamedSlate.id,
          name: renamedSlate.name,
        };
      } else {
        throw new ForbiddenException('Only the owner can rename this slate.');
      }
    } catch (e) {
      if (e instanceof HttpException) throw e;
      throw new InternalServerErrorException(
        'Trouble renaming slate. Try again?',
      );
    }
  }

  async updateSlate(
    id: string,
    user: DecodedIdToken | null,
    guestTokenReceived: string | null,
    content: any,
  ) {
    try {
      const slate = await this.prisma.slate.findUnique({
        where: { id },
        select: {
          id: true,
          authorId: true,
          guestToken: true,
        },
      });

      if (!slate) {
        throw new NotFoundException('Slate not found to update!');
      }

      if (
        (user && slate.authorId && slate.authorId === user.uid) ||
        (guestTokenReceived &&
          slate.guestToken &&
          slate.guestToken === guestTokenReceived)
      ) {
        const updatedSlate = await this.prisma.slate.update({
          where: { id },
          data: { content },
        });

        return { id: updatedSlate.id, success: true };
      } else {
        throw new ForbiddenException('You can only edit your own slates.');
      }
    } catch (e) {
      if (e instanceof HttpException) throw e;
      throw new InternalServerErrorException(
        'Trouble saving changes. Try again!',
      );
    }
  }

  //
  // async updateGuestSlate(
  //   id: string,
  //   guestTokenReceived: string | null,
  //   content: any,
  // ) {
  //   if (!guestTokenReceived) {
  //     throw new ForbiddenException(
  //       'Guest key is required to update a guest slate.',
  //     );
  //   }

  //   try {
  //     const slate = await this.prisma.slate.findUnique({
  //       where: { id, guestToken: guestTokenReceived },
  //     });

  //     if (!slate) {
  //       throw new NotFoundException('Guest slate not found.');
  //     }

  //     return await this.prisma.slate.update({
  //       where: { id },
  //       data: { content },
  //     });
  //   } catch (e) {
  //     if (e instanceof HttpException) throw e;
  //     throw new InternalServerErrorException('Error updating guest slate...');
  //   }
  // }

  async deleteSlate(
    id: string,
    user: DecodedIdToken | null,
    guestTokenReceived: string | null,
  ) {
    try {
      const slate = await this.prisma.slate.findUnique({
        where: { id },
        select: {
          id: true,
          authorId: true,
          guestToken: true,
        },
      });

      if (!slate) {
        throw new NotFoundException('Slate already gone!');
      }

      if (user) {
        const slateCount = await this.prisma.slate.count({
          where: { authorId: user.uid },
        });
        if (slateCount <= 1) {
          throw new ForbiddenException(
            'You need at least one slate to write in!',
          );
        }

        if (slate.authorId !== user.uid) {
          throw new ForbiddenException('You can only delete your own slates.');
        }

        await this.prisma.slate.delete({
          where: { id, authorId: user.uid },
        });
        return { success: true };
      } else if (slate.guestToken) {
        if (guestTokenReceived !== slate.guestToken) {
          throw new ForbiddenException("This slate doesn't belong to you.");
        }

        throw new ForbiddenException("Temporary slates can't be deleted!");
      } else {
        throw new ForbiddenException('Only the owner can delete this slate.');
      }
    } catch (e) {
      if (e instanceof HttpException) throw e;
      throw new InternalServerErrorException(
        'Trouble deleting slate. Try again?',
      );
    }
  }
}
