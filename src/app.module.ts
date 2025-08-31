import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { WarrantiesModule } from './warranties/warranties.module';
import { PaymentsController } from './payments/payments.controller';

@Module({
  imports: [TypeOrmModule.forRoot(databaseConfig), UsersModule, AuthModule, WarrantiesModule],
  controllers: [AppController, PaymentsController],
  providers: [AppService],
})
export class AppModule {}
