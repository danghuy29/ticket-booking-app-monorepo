export type UserRole = "customer" | "admin";

export interface UserDto {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  /** ISO 8601 timestamp. */
  createdAt: string;
}
