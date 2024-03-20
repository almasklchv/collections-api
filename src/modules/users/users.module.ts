import { Module } from '@nestjs/common';
import { UsersController } from './presenter/users.controller';
import { UsersService } from './domain/users.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersRepository } from './data/users.repository';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService],
})
export class UsersModule {}
