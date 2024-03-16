import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from '../domain/users.service';
import { User } from '@prisma/client';
import { AuthenticatedUser } from 'src/common/decorators/authenticated-user.decorator';
import { UserResource } from './resources';

@Controller('/users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  async createUser(@Body() dto: User) {
    const createdUser = await this.userService.createUser(dto);
    return new UserResource(createdUser);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Patch('/:id')
  async updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @AuthenticatedUser() user: User,
    @Body() body: Partial<User>,
  ) {
    const updatedUser = await this.userService.updateUser(id, user, body);
    return new UserResource(updatedUser);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Delete('/:id')
  async deleteUser(
    @Param('id', ParseUUIDPipe) id: string,
    @AuthenticatedUser() user: User,
  ) {
    const deletedUser = await this.userService.deleteUser(id, user);
    return new UserResource(deletedUser);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get('/:id')
  async getUser(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.userService.findOne(id);
    return new UserResource(user);
  }
}
