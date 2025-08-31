import { Module } from '@nestjs/common';
import { WarrantiesService } from './warranties.service';
import { WarrantiesController } from './warranties.controller';
import { Warranty } from './entities/warranty.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Warranty]), UsersModule],
  controllers: [WarrantiesController],
  providers: [WarrantiesService],
  exports: [WarrantiesService],
})
export class WarrantiesModule {}
