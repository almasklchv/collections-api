import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { UsersRepository } from '../data/users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async createUser(user: User) {
    if (await this.usersRepository.findOneByIdOrEmail(user.email)) {
      throw new HttpException(
        'User with this email already exists.',
        HttpStatus.CONFLICT,
      );
    }

    const createdUser = await this.usersRepository.createUser(user);

    return createdUser;
  }

  async updateUser(id: string, user: User, body: Partial<User>) {
    if (id !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenException();
    }
    if (!(await this.usersRepository.findOneByIdOrEmail(id))) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const updatedUser = await this.usersRepository.updateUser(id, body);

    return updatedUser;
  }

  async deleteUser(id: string, user: User) {
    if (id !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenException();
    }
    if (!(await this.usersRepository.findOneByIdOrEmail(id))) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const deletedUser = await this.usersRepository.deleteUser(id);
    return deletedUser;
  }

  async findOne(idOrEmail: string) {
    return this.usersRepository.findOneByIdOrEmail(idOrEmail);
  }
}
