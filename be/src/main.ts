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
    origin: ['http://localhost:3000', 'https://kasoro.vercel.app'],
    credentials: true,
  });
  
  // Setup session with proper CORS support
  app.use(
    session({
      secret: 'x-oauth-secret',
      resave: false,
      saveUninitialized: false,
      cookie: { 
        secure: process.env.NODE_ENV === 'production', // Only use secure in production
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Required for cross-site cookies
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
      },
    }),
  );
  
  await app.listen(process.env.PORT ?? 3001);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
