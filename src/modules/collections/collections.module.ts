import { Module } from '@nestjs/common';
import { CollectionsController } from './presenter/collections.controller';
import { CollectionsService } from './domain/collections.service';
import { CollectionsRepository } from './data/collections.repository';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [CollectionsController],
  providers: [CollectionsService, CollectionsRepository, PrismaService],
})
export class CollectionsModule {}
