import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { genSalt, hash } from 'bcrypt';
import { BaseRepository } from 'src/common/base/base.repository';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class UsersRepository extends BaseRepository {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  async findOneByIdOrEmail(idOrEmail: string) {
    const user = await this.prismaService.user.findFirst({
      where: {
        OR: [{ id: idOrEmail }, { email: idOrEmail }],
      },
    });

    if (!user) return null;
    return user;
  }

  async createUser(user: User) {
    const hashedPassword = user.passwordHash
      ? await this.hashPassword(user.passwordHash)
      : null;
    const savedUser = await this.prismaService.user.create({
      data: {
        ...user,
        passwordHash: hashedPassword,
        id: this.generateUUID(),
        role: 'USER',
        status: 'ACTIVE',
      },
    });
    return savedUser;
  }

  async updateUser(id: string, updateUser: Partial<User>) {
    const updatedUser = await this.prismaService.user.update({
      where: { id },
      data: {
        ...updateUser,
      },
    });
    return updatedUser;
  }

  async deleteUser(id: string) {
    const deletedUser = await this.prismaService.user.delete({
      where: { id },
    });
    return deletedUser;
  }

  private async hashPassword(password: string) {
    return hash(password, await genSalt(10));
  }
}
