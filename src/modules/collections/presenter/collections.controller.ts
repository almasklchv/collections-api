import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CollectionsService } from '../domain/collections.service';
import { Collection, Item, User } from '@prisma/client';
import { AuthenticatedUser, Public } from 'src/common/decorators';

@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Post()
  async createCollection(
    @Body() dto: Collection,
    @AuthenticatedUser() user: User,
  ) {
    const collection = await this.collectionsService.createCollection(
      dto,
      user,
    );
    return collection;
  }

  @Public()
  @Get('/big')
  async getFiveBigCollections() {
    const collections = await this.collectionsService.getFiveBigCollections();
    return collections;
  }

  @Public()
  @Get('/:id/by-collection-id')
  async getCollectionById(@Param('id', ParseUUIDPipe) id: string) {
    const collection = await this.collectionsService.findOne(id);
    return collection;
  }

  @Public()
  @Get('/:id')
  async getCollectionsByUserId(@Param('id', ParseUUIDPipe) id: string) {
    const collections =
      await this.collectionsService.getCollectionsByUserId(id);
    return collections;
  }

  @Patch('/:id')
  async updateCollection(
    @Param('id', ParseUUIDPipe) id: string,
    @AuthenticatedUser() user: User,
    @Body() updateCollection: Partial<Collection>,
  ) {
    const collection = await this.collectionsService.findOne(id);
    if (collection.userId !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenException();
    }
    const updatedCollection = await this.collectionsService.updateCollection(
      id,
      updateCollection,
    );
    return updatedCollection;
  }

  @Post('/:id/add-item')
  async addItemToCollection(
    @Param('id', ParseUUIDPipe) id: string,
    @AuthenticatedUser() user: User,
    @Body() body: Item,
  ) {
    const collection = await this.collectionsService.findOne(id);
    if (collection.userId !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenException();
    }
    const updatedCollection = await this.collectionsService.addItemToCollection(
      id,
      body,
    );
    return updatedCollection;
  }

  @Delete('/:id')
  async deleteCollection(
    @Param('id', ParseUUIDPipe) id: string,
    @AuthenticatedUser() user: User,
  ) {
    const collection = await this.collectionsService.findOne(id);
    if (collection.userId !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenException();
    }
    const deletedCollection =
      await this.collectionsService.deleteCollection(id);
    return deletedCollection;
  }
}
