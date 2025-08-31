import { Controller, Get, UseGuards, Request, Patch, Body, Param, Put, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UpdateProfilePremiumDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ChangeEmailDto } from './dto/change-email.dto';


@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req) {
    return this.usersService.findByIdwithoutPass(req.user.id);
  }

  // POST endpoint to change premium status to true
@Post('premium/:id')
async changePremiumStatus(@Param('id') id: string, @Body() tapWebhookData: any) {
  // console.log(`Tap webhook received for user ${id}:`, tapWebhookData);
  
  // Verify the payment was successful
  if (tapWebhookData.status === 'CAPTURED' || tapWebhookData.status === 'AUTHORIZED') {
    const updateData = { premium: true };
    return this.usersService.updatePremium(id, updateData);
  } else {
    // console.log(`Payment not successful for user ${id}. Status: ${tapWebhookData.status}`);
    return { message: 'Payment not successful' };
  }
}

  // User endpoint: increment their own item_count
  @UseGuards(JwtAuthGuard)
  @Post('me/increment-item-count')
  async incrementItemCount(@Request() req) {
    const updatedUser = await this.usersService.incrementItemCount(req.user.id);
    return {
      message: 'Item count incremented successfully',
      user: updatedUser
    };
  }

  // User endpoint: change their own password
  @UseGuards(JwtAuthGuard)
  @Put('me/password')
  async changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
    await this.usersService.changePassword(
      req.user.id,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword
    );
    return { message: 'Password changed successfully' };
  }

  // User endpoint: change their own email
  @UseGuards(JwtAuthGuard)
  @Put('me/email')
  async changeEmail(@Request() req, @Body() changeEmailDto: ChangeEmailDto) {
    await this.usersService.changeEmail(
      req.user.id,
      changeEmailDto.currentPassword,
      changeEmailDto.newEmail
    );
    return { message: 'Email changed successfully' };
  }
} 