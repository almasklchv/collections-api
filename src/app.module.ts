import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CollectionsModule } from './modules/collections/collections.module';
import { ItemsModule } from './modules/items/items.module';
import { SearchModule } from './modules/search/search.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    CollectionsModule,
    ItemsModule,
    SearchModule,
    PrismaModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
