import { Module } from '@nestjs/common';
import { ItemsController } from './presenter/items.controller';
import { ItemsService } from './domain/items.service';
import { ItemsRepository } from './data/items.repository';
import { PrismaService } from '../prisma/prisma.service';
import { CollectionsService } from '../collections/domain/collections.service';
import { CollectionsRepository } from '../collections/data/collections.repository';

@Module({
  controllers: [ItemsController],
  providers: [
    ItemsService,
    ItemsRepository,
    PrismaService,
    CollectionsService,
    CollectionsRepository,
  ],
})
export class ItemsModule {}
