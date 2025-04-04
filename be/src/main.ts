import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, Logger } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  logger.log('Starting application...');
  
  const app = await NestFactory.create(AppModule);
  
  // Set up WebSockets
  app.useWebSocketAdapter(new IoAdapter(app));
  
  // Apply validation pipes globally
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
  }));
  
  const configService = app.get(ConfigService);

  console.log('Database config:', {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    database: process.env.DB_DATABASE,
    // 비밀번호는 보안을 위해 출력하지 않음
  });
  
  // Print environment variables to debug
  console.log('API_KEY configured:', configService.get('API_KEY') ? 'Yes' : 'No');
  console.log('API_KEY_SECRET configured:', configService.get('API_KEY_SECRET') ? 'Yes' : 'No');
  
  // Setup Swagger
  try {
    logger.log('Setting up Swagger documentation...');
    const config = new DocumentBuilder()
      .setTitle('Kasoro API')
      .setDescription('The Kasoro API documentation')
      .setVersion('1.0')
      .addTag('auth', 'Authentication endpoints')
      .addTag('communities', 'Communities management')
      .addTag('messages', 'Messages in communities')
      .addTag('users', 'User management')
      .addBearerAuth()
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
    logger.log('Swagger documentation is set up at /api path');
  } catch (error) {
    logger.error('Failed to set up Swagger: ' + error.message);
  }

  // Get frontend URL based on environment
  const frontendUrl = process.env.NODE_ENV === 'production' 
    ? 'https://kasoro.vercel.app'
    : 'http://localhost:3000';
  
  logger.log('Using frontend URL for CORS: ' + frontendUrl);
  
  // Enable CORS with credentials and proper headers
  app.enableCors({
    origin: true, // Allow all origins
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
  
  logger.log(`Application is running on: ${await app.getUrl()}`);
  logger.log(`WebSocket server enabled at: ${await app.getUrl()}/communities`);
  logger.log(`Swagger documentation available at: ${await app.getUrl()}/api`);
}

bootstrap();
