import { Injectable } from '@nestjs/common';
import { Collection, Item, User } from '@prisma/client';
import { BaseRepository } from 'src/common/base/base.repository';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class CollectionsRepository extends BaseRepository {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  async findOne(id: string) {
    const collection = await this.prismaService.collection.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });
    if (!collection) return null;
    return collection;
  }

  async createCollection(collection: Collection, user: User) {
    const createdCollection = await this.prismaService.collection.create({
      data: {
        ...collection,
        id: this.generateUUID(),
        userId: user.id,
      },
    });
    return createdCollection;
  }

  async updateCollection(id: string, updateCollection: Partial<Collection>) {
    const updatedCollection = await this.prismaService.collection.update({
      where: { id: id },
      data: { ...updateCollection },
    });
    return updatedCollection;
  }

  async addItemToCollection(id: string, item: Item) {
    const collection = await this.findOne(id);
    if (!collection) return null;
    item.id = this.generateUUID();
    const updatedCollection = await this.prismaService.collection.update({
      where: { id },
      data: {
        items: {
          create: [{ ...item, userId: collection.userId }],
        },
      },
    });
    return updatedCollection;
  }

  async deleteCollection(id: string) {
    const deletedCollection = await this.prismaService.collection.delete({
      where: { id },
    });
    return deletedCollection;
  }

  async getFiveBigCollections() {
    const collectionsWithItems = await this.prismaService.collection.findMany({
      include: {
        items: true,
      },
    });

    const collectionsWithItemCount = collectionsWithItems.map((collection) => ({
      ...collection,
      itemCount: collection.items.length,
    }));

    const sortedCollections = collectionsWithItemCount.sort(
      (a, b) => b.itemCount - a.itemCount,
    );

    const topFiveCollections = sortedCollections.slice(0, 5);

    return topFiveCollections;
  }

  async getCollectionsByUserId(userId: string) {
    const collections = await this.prismaService.collection.findMany({
      where: { userId: userId },
    });
    return collections;
  }
}
