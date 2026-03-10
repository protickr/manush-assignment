import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { Role, User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(phone: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByPhone(phone);
    if (!user || !user.passwordHash) return null;

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return null;

    // Only Admins & Sales Reps can log in
    if (user.role !== Role.ADMIN && user.role !== Role.SALES_REPRESENTATIVE) {
      return null;
    }

    return user;
  }

  login(user: User) {
    const payload = { sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
