import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
   // Set global prefix for all routes
   app.setGlobalPrefix('api');

   app.enableCors({
    origin: '*',
    credentials: true,
  });
  
  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that do not have any decorators
      transform: true, // Transform payloads to DTO instances
      forbidNonWhitelisted: true, // Throw errors if non-whitelisted properties are present
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
