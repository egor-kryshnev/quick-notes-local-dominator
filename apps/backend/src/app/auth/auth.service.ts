import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async register(username: string, password: string) {
    const existing = await this.users.findByUsername(username);
    if (existing) throw new UnauthorizedException('User already exists');
    const user = await this.users.create(username, password);
    return { id: user.id, username: user.username };
  }

  async login(username: string, password: string) {
    const user = await this.users.validate(username, password);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, username: user.username };
    const token = await this.jwt.signAsync(payload);

    return { access_token: token };
  }
}
