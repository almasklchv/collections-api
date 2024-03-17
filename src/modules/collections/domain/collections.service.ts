import { Injectable } from '@nestjs/common';
import { CollectionsRepository } from '../data/collections.repository';
import { Collection, Item, User } from '@prisma/client';

@Injectable()
export class CollectionsService {
  constructor(private readonly collectionsRepository: CollectionsRepository) {}

  async findOne(id: string) {
    const collection = await this.collectionsRepository.findOne(id);
    if (!collection) return null;
    return collection;
  }

  async createCollection(collection: Collection, user: User) {
    const createdCollection = await this.collectionsRepository.createCollection(
      collection,
      user,
    );
    return createdCollection;
  }

  async updateCollection(id: string, updateCollection: Partial<Collection>) {
    const updatedCollection = await this.collectionsRepository.updateCollection(
      id,
      updateCollection,
    );
    return updatedCollection;
  }

  async addItemToCollection(id: string, body: Item) {
    const collection = await this.collectionsRepository.addItemToCollection(
      id,
      body,
    );
    return collection;
  }
}
