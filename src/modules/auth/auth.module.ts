import { Module } from '@nestjs/common';
import { AuthController } from './presenter/auth.controller';
import { AuthService } from './domain/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { PrismaService } from '../prisma/prisma.service';
import { options } from 'src/config/auth.config';
import { ConfigModule } from '@nestjs/config';
import { STRATEGIES } from './strategies';
import { GUARDS } from 'src/common/guards';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync(options()),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, ...STRATEGIES, ...GUARDS],
})
export class AuthModule {}
