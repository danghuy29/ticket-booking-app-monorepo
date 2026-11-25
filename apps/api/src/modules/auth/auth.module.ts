import { PasswordHasher } from "@nestjs/authentication";
import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";

@Module({
  controllers: [AuthController],
  // PasswordHasher is a plain class (no @Injectable), so it's provided as a value instead of
  // importing AuthenticationModule, whose guard/session machinery we don't use.
  providers: [AuthService, { provide: PasswordHasher, useValue: new PasswordHasher() }],
})
export class AuthModule {}
