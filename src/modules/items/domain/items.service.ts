import { Injectable } from '@nestjs/common';
import { Item } from '@prisma/client';
import { ItemsRepository } from '../data/items.repository';

@Injectable()
export class ItemsService {
  constructor(private readonly itemsRepository: ItemsRepository) {}

  async updateItem(id: string, item: Partial<Item>) {
    return this.itemsRepository.updateItem(id, item);
  }

  async deleteItem(id: string) {
    return this.itemsRepository.deleteItem(id);
  }

  findOne(id: string) {
    return this.itemsRepository.findOne(id);
  }
}
