import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  console.log('Database config:', {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    database: process.env.DB_DATABASE,
    // 비밀번호는 보안을 위해 출력하지 않음
  });
  const app = await NestFactory.create(AppModule);

  
  const configService = app.get(ConfigService);

  
  

  // Print environment variables to debug
  console.log('API_KEY configured:', configService.get('API_KEY') ? 'Yes' : 'No');
  console.log('API_KEY_SECRET configured:', configService.get('API_KEY_SECRET') ? 'Yes' : 'No');
  
  // Get frontend URL based on environment
  const frontendUrl = process.env.NODE_ENV === 'production' 
    ? 'https://kasoro.vercel.app'
    : 'http://localhost:3000';
  
  console.log('Using frontend URL for CORS:', frontendUrl);
  
  // Enable CORS with credentials and proper headers
  app.enableCors({
    origin: [frontendUrl],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Set-Cookie'],
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
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
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
    frontendUrl,
  });
  
  const port = configService.get('PORT') || 3001;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
