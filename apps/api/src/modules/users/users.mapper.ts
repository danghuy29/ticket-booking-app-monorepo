import type { UserDto } from "@ticket/shared";
import type { UserRow } from "@/database/schemas/user";

export function toUserDto(user: UserRow): UserDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
  };
}
