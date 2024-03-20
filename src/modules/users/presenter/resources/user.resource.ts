import { $Enums, User } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class UserResource implements User {
  id: string;
  email: string;
  name: string;
  role: $Enums.Role;
  status: $Enums.Status;
  updatedAt: Date;

  @Exclude()
  passwordHash: string;
  @Exclude()
  createdAt: Date;

  constructor(user: Partial<User>) {
    Object.assign(this, user);
  }
}
