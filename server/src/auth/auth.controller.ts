import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { SignupDto } from './dto/signup.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() body: SignupDto) {
    return this.authService.signup(body);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: any) {
    return this.authService.login(body.email, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Post('register-tenant')
  async registerTenant(@Request() req: any, @Body() body: any) {
    return this.authService.registerTenant(req.user.sub, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('join-tenant')
  async joinTenant(@Request() req: any, @Body() body: any) {
    return this.authService.joinTenant(req.user.sub, body.businessNumber);
  }
}
