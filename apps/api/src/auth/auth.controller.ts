// apps/api/src/auth/auth.controller.ts
import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { ApiResponse } from '../common/interfaces/api-response.interface';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    async register(@Body() registerDto: RegisterDto): Promise<ApiResponse<any>> {
        const result = await this.authService.register(registerDto);

        return {
            data: result,
        };
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto): Promise<ApiResponse<any>> {
        const result = await this.authService.login(loginDto);

        return {
            data: result,
        };
    }

    @Post('refresh')
    async refresh(@Body('refreshToken') refreshToken: string): Promise<ApiResponse<any>> {
        const result = await this.authService.refresh(refreshToken);

        return {
            data: result,
        };
    }

    @Get('profile')
    @UseGuards(JwtAuthGuard)
    async getProfile(@CurrentUser() user: any): Promise<ApiResponse<any>> {
        return {
            data: user,
        };
    }
}
