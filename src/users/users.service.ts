import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
type UserWithoutPassword = Omit<User, 'password'>;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(userData: Partial<User>): Promise<User> {

    if (!userData.email) {
      throw new ConflictException('Email is required');
    }
    // lower case the email
    userData.email = userData.email.toLowerCase();
    const existingUser = await this.findByEmail(userData.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  // exclude password from the response
  async findByIdwithoutPass(id: string): Promise<UserWithoutPassword> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
  
  // update the user's premium status to true
  async updatePremium(id: string, updateData: Partial<User>): Promise<UserWithoutPassword> {
    await this.usersRepository.update(id, { premium: true });
    // console.log(`User ${id} is now premium`);
    return this.findByIdwithoutPass(id);
  }

  // increment the user's item_count automatically
  async incrementItemCount(id: string): Promise<UserWithoutPassword> {
    await this.usersRepository.increment({ id }, 'item_count', 1);
    return this.findByIdwithoutPass(id);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.findById(userId);
    
    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await this.usersRepository.update(userId, { password: hashedNewPassword });
  }

  async changeEmail(userId: string, currentPassword: string, newEmail: string): Promise<void> {
    const user = await this.findById(userId);
    
    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Check if new email already exists
    const existingUser = await this.findByEmail(newEmail);
    if (existingUser && existingUser.id !== userId) {
      throw new ConflictException('Email already exists');
    }

    // Update email
    await this.usersRepository.update(userId, { email: newEmail });
  }
} 