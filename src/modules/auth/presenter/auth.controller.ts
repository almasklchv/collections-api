import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from '../domain/auth.service';
import { SignUpBody } from './bodies/sign-up.body';
import { SignInBody } from './bodies';
import { Request, Response } from 'express';
import { Tokens } from 'src/common/entities/tokens.interface';
import { ConfigService } from '@nestjs/config';
import { Cookie, Public, UserAgent } from 'src/common/decorators';
import { UserResource } from 'src/modules/users/presenter/resources';

const REFRESH_TOKEN = 'refreshtoken';
const ACCESS_TOKEN = 'accesstoken';

@Public()
@Controller('/auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('/sign-up')
  async signUp(@Body() dto: SignUpBody) {
    const user = await this.authService.signUp(dto);
    if (!user) throw new BadRequestException();
    return new UserResource(user);
  }

  @Post('/sign-in')
  async signIn(
    @Body() dto: SignInBody,
    @Res() res: Response,
    @UserAgent() agent: string,
  ) {
    const tokens = await this.authService.signIn(dto, agent);
    if (!tokens) {
      throw new BadRequestException();
    }
    this.setRefreshTokenToCookies(tokens, res);
  }

  @Get('/sign-out')
  async signOut(
    @Cookie(REFRESH_TOKEN) refreshToken: string,
    @Res() res: Response,
  ) {
    console.log(refreshToken);
    if (!refreshToken) {
      res.sendStatus(HttpStatus.OK);
      return;
    }

    await this.authService.deleteRefreshToken(refreshToken);
    res.cookie(REFRESH_TOKEN, '', {
      httpOnly: true,
      secure: true,
      expires: new Date(),
    });
    res.cookie(ACCESS_TOKEN, '', {
      httpOnly: true,
      secure: true,
      expires: new Date(),
    });
    res.sendStatus(HttpStatus.OK);
  }

  @Get('/check')
  async checkAuthStatus(@Req() req: Request, @Res() res: Response) {
    const token: string = req.headers['authorization'];
    if (!token) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ authenticated: false });
    }

    const isValid = await this.authService.checkAuthToken(token.slice(7));
    return res.status(HttpStatus.OK).json({ authenticated: isValid });
  }

  @Get('/refresh')
  async refreshTokens(
    @Cookie(REFRESH_TOKEN) refreshToken: string,
    @Res() res: Response,
    @UserAgent() agent: string,
  ) {
    if (!refreshToken) {
      throw new UnauthorizedException();
    }
    const tokens = await this.authService.refreshTokens(refreshToken, agent);
    if (!tokens) {
      throw new UnauthorizedException();
    }
    this.setRefreshTokenToCookies(tokens, res);
  }

  private setRefreshTokenToCookies(tokens: Tokens, res: Response) {
    if (!tokens) {
      throw new UnauthorizedException();
    }
    res.cookie(REFRESH_TOKEN, tokens.refreshToken.token, {
      httpOnly: true,
      sameSite: 'lax',
      expires: new Date(tokens.refreshToken.expiresAt),
      secure:
        this.configService.get('NODE_ENV', 'development') === 'production',
      path: '/',
    });
    res.cookie(ACCESS_TOKEN, tokens.accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure:
        this.configService.get('NODE_ENV', 'development') === 'production',
      path: '/',
    });
    res.status(HttpStatus.CREATED).json({ accessToken: tokens.accessToken });
  }
}
