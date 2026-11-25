import { Body, Controller, Post } from "@nestjs/common";
import { type RegisterInput, registerSchema, type UserDto } from "@ticket/shared";
import { AuthService } from "./auth.service.js";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("sign-up")
  signUp(@Body({ schema: registerSchema }) body: RegisterInput): Promise<UserDto> {
    return this.authService.register(body);
  }
}
