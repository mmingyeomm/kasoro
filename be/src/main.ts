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
  
  // Enable CORS - allow both local and production domains
  app.enableCors({
    origin: ['http://localhost:3000', 'https://kasoro.vercel.app'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  // Setup session with proper CORS support
  app.use(
    session({
      secret: 'x-oauth-secret',
      resave: true, 
      saveUninitialized: true,
      rolling: true, // Update expiration with each request
      proxy: true, // Trust the reverse proxy
      cookie: { 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none', // Always use none for cross-site
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        path: '/',
      },
      name: 'connect.sid', // Match the existing cookie name
    }),
  );
  
  // Log session middleware configuration
  console.log('Session middleware configured with settings:', {
    resave: true,
    saveUninitialized: true,
    cookieSecure: process.env.NODE_ENV === 'production',
    cookieSameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    environment: process.env.NODE_ENV || 'development',
  });
  
  await app.listen(process.env.PORT ?? 3001);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
