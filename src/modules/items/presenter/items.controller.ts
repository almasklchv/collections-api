import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import { ItemsService } from '../domain/items.service';
import { Item, User } from '@prisma/client';
import { AuthenticatedUser, Public } from 'src/common/decorators';
import { CollectionsService } from 'src/modules/collections/domain/collections.service';

@Controller('items')
export class ItemsController {
  constructor(
    private readonly itemsService: ItemsService,
    private readonly collectionsService: CollectionsService,
  ) {}

  @Public()
  @Get('/recent')
  async getRecentlyAddedItems() {
    const items = await this.itemsService.getRecentlyAddedItems();
    return items;
  }

  @Public()
  @Get('/get-all/:id')
  async getItemsByCollectionId(@Param('id', ParseUUIDPipe) id: string) {
    const items = await this.itemsService.getItemsByCollectionId(id);
    return items;
  }

  @Get('/:id')
  async getItem(@Param('id', ParseUUIDPipe) id: string) {
    const item = await this.itemsService.findOne(id);
    return item;
  }

  @Patch('/:id')
  async updateItem(
    @Param('id', ParseUUIDPipe) id: string,
    @AuthenticatedUser() user: User,
    @Body() dto: Partial<Item>,
  ) {
    const item = await this.itemsService.findOne(id);
    const collection = await this.collectionsService.findOne(item.collectionId);
    if (collection.userId !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenException();
    }
    const updatedItem = await this.itemsService.updateItem(id, dto);
    return updatedItem;
  }

  @Delete('/:id')
  async deleteItem(
    @Param('id', ParseUUIDPipe) id: string,
    @AuthenticatedUser() user: User,
  ) {
    const item = await this.itemsService.findOne(id);
    const collection = await this.collectionsService.findOne(item.collectionId);
    if (collection.userId !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenException();
    }
    const deletedItem = await this.itemsService.deleteItem(id);
    return deletedItem;
  }
}
