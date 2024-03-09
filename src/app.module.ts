import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { CollectionModule } from './modules/collection/collection.module';
import { ItemModule } from './modules/item/item.module';
import { SearchModule } from './modules/search/search.module';

@Module({
  imports: [AuthModule, UserModule, CollectionModule, ItemModule, SearchModule],
})
export class AppModule {}
