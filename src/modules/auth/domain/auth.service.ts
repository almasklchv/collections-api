import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { SignInBody, SignUpBody } from '../presenter/bodies';
import { UsersService } from 'src/modules/users/domain/users.service';
import { Tokens } from 'src/common/entities/tokens.interface';
import { compare } from 'bcrypt';
import { Token, User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { BaseRepository } from 'src/common/base/base.repository';
import { add } from 'date-fns';

@Injectable()
export class AuthService extends BaseRepository {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
  ) {
    super();
  }

  async signUp(dto: SignUpBody) {
    const isUserExists = !!(await this.userService.findOne(dto.email));

    if (isUserExists)
      throw new ConflictException(
        'Пользователь с таким email уже зарегистрирован.',
      );

    const user = {
      email: dto.email,
      passwordHash: dto.password,
      name: dto.name,
    };
    return this.userService.createUser(user as User).catch((err) => {
      this.logger.error(err);
      return null;
    });
  }

  async signIn(dto: SignInBody, agent: string): Promise<Tokens> {
    const user: User = await this.userService
      .findOne(dto.email)
      .catch((err) => {
        this.logger.error(err);
        return null;
      });

    if (!user || !compare(dto.password, user.passwordHash)) {
      throw new UnauthorizedException();
    }
    return this.generateTokens(user, agent);
  }

  async refreshTokens(refreshToken: string, agent: string): Promise<Tokens> {
    const token = await this.prismaService.token.findUnique({
      where: { token: refreshToken },
    });
    if (!token) {
      throw new UnauthorizedException();
    }
    await this.prismaService.token.delete({
      where: { token: refreshToken },
    });
    if (new Date(token.expiresAt) < new Date()) {
      throw new UnauthorizedException();
    }
    const user = await this.userService.findOne(token.userId);
    return this.generateTokens(user, agent);
  }

  private async generateTokens(user: User, agent: string): Promise<Tokens> {
    const accessToken =
      'Bearer ' +
      (await this.jwtService.signAsync({
        id: user.id,
        email: user.email,
        role: user.role,
      }));
    const refreshToken = await this.getRefreshToken(user.id, agent);
    return { accessToken, refreshToken };
  }

  private async getRefreshToken(userId: string, agent: string): Promise<Token> {
    const _token = await this.prismaService.token.findFirst({
      where: { userId, userAgent: agent },
    });
    const token = _token?.token ?? '';
    return this.prismaService.token.upsert({
      where: { token },
      update: {
        token: this.generateUUID(),
        expiresAt: add(new Date(), { months: 1 }),
      },
      create: {
        token: this.generateUUID(),
        expiresAt: add(new Date(), { months: 1 }),
        userId,
        userAgent: agent,
      },
    });
  }
}
