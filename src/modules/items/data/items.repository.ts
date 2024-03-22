import { Injectable } from '@nestjs/common';
import { Item } from '@prisma/client';
import { BaseRepository } from 'src/common/base/base.repository';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class ItemsRepository extends BaseRepository {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  async updateItem(id: string, updateItem: Partial<Item>) {
    const updatedItem = await this.prismaService.item.update({
      where: { id: id },
      data: { ...updateItem },
    });
    return updatedItem;
  }

  async deleteItem(id: string) {
    const deletedItem = await this.prismaService.item.delete({
      where: { id },
    });
    return deletedItem;
  }

  async findOne(id: string) {
    const item = this.prismaService.item.findUnique({ where: { id } });
    if (!item) return null;
    return item;
  }

  async getRecentlyAddedItems() {
    const date24HoursAgo = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
    const items = this.prismaService.item.findMany({
      where: { createdAt: { gt: date24HoursAgo } },
      orderBy: { createdAt: 'desc' },
    });
    return items;
  }
}
