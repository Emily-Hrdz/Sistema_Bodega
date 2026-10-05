import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { ConfigService } from '@nestjs/config';
import { jwtSettings } from '../jwt-settings';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService, config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSettings(config).secret,
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findOne(payload.sub);
    
    if (!user || !user.activo) {
      throw new UnauthorizedException();
    }

    return { 
      id: payload.sub, 
      email: payload.email, 
      rol: user.rol
    };
  }
}
