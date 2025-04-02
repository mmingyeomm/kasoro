import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Print environment variables to debug
  console.log('API_KEY configured:', configService.get('API_KEY') ? 'Yes' : 'No');
  console.log('API_KEY_SECRET configured:', configService.get('API_KEY_SECRET') ? 'Yes' : 'No');
  
  // Enable CORS
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });
  
  // Setup session
  app.use(
    session({
      secret: 'x-oauth-secret',
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false }, // Set to true in production with HTTPS
    }),
  );
  
  await app.listen(process.env.PORT ?? 3001);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
