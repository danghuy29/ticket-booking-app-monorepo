import { Injectable } from "@nestjs/common";
import { InjectDrizzle } from "@nestjs/drizzle";
import type { Database } from "@/database/database";
import { users } from "@/database/schemas/user";

@Injectable()
export class UsersService {
  constructor(@InjectDrizzle() private readonly db: Database) {}

  // create(createUserDto) {
  //   return "This action adds a new user";
  // }

  async findAll() {
    return this.db.select().from(users);
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  // update(id: number, updateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
