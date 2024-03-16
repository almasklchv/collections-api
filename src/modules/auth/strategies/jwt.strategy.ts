import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { User } from '@prisma/client';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from 'src/common/entities/jwt-payload.interface';
import { UsersService } from 'src/modules/users/domain/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET_KEY'),
    });
  }

  async validate(payload: JwtPayload) {
    const user: User = await this.userService
      .findOne(payload.id)
      .catch((err) => {
        this.logger.error(err);
        return null;
      });
    if (!user || user.status === 'BLOCKED') {
      throw new UnauthorizedException();
    }
    return payload;
  }
}