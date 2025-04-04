# Kasoro Backend Architecture

This document provides an overview of the Kasoro backend architecture, explaining the main components, their interactions, and the overall system design.

## Table of Contents

1. [Technology Stack](#technology-stack)
2. [Project Structure](#project-structure)
3. [Core Modules](#core-modules)
4. [Authentication Flow](#authentication-flow)
5. [Game Room & Message System](#game-room--message-system)
6. [Wallet Integration](#wallet-integration)
7. [Database Models](#database-models)
8. [API Endpoints](#api-endpoints)

## Technology Stack

The backend is built with the following technologies:

- **NestJS**: A progressive Node.js framework for building efficient and scalable server-side applications
- **TypeORM**: An ORM for TypeScript and JavaScript that integrates with many databases
- **MySQL**: The database system used for data persistence
- **Express**: Web server framework integrated with NestJS
- **OAuth**: Authentication mechanism for Twitter (X) integration
- **WebSockets**: For real-time communication between clients and server

## Project Structure

The codebase follows NestJS's modular architecture, with the following main directories:

- `src/`: Main source code directory
  - `auth/`: Authentication-related modules, controllers, and services
  - `user/`: User management functionality
  - `gameroom/`: Game room management
  - `message/`: Message handling and real-time communication
  - `config/`: Application configuration
  - `main.ts`: Application entry point

## Core Modules

### App Module

Central module that imports and organizes all other modules:

```typescript
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(databaseConfig),
    AuthModule,
    UserModule,
    GameRoomModule,
    MessageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

### User Module

Handles user operations, including:
- User creation and retrieval
- Profile management
- Wallet address linking

### Auth Module

Manages authentication with:
- Twitter (X) OAuth integration
- Session management
- Guards for protecting routes

### Game Room Module

Controls game room functionality:
- Creating game rooms
- Listing available game rooms
- Game room details and parameters
- Access control

### Message Module

Deals with messaging capabilities:
- Storing and retrieving messages
- Real-time message delivery via WebSockets
- Message filtering by game room

## Authentication Flow

The Kasoro application uses Twitter OAuth for authentication:

1. **Login Request**: User initiates login (`/auth/login/twitter`)
2. **OAuth Handshake**: 
   - Backend gets request token from Twitter
   - User is redirected to Twitter for authentication
3. **OAuth Callback**: 
   - Twitter redirects back with oauth_token and verifier
   - Backend exchanges these for access token
4. **User Creation/Update**:
   - User data is retrieved from Twitter API
   - User is created or updated in the database
   - Session is established with user details
5. **Session Management**:
   - User session contains authentication data
   - Guards protect routes requiring authentication

## Game Room & Message System

Game rooms are the core feature of the application:

1. **Game Room Creation**:
   - Authenticated users can create game rooms with parameters:
   - Name, description, bounty amount, time limit, base fee
   - Creator is associated with the game room

2. **Message System**:
   - Messages are linked to specific game rooms
   - Users can send and receive messages in real-time
   - Message history is persisted in the database

## Wallet Integration

The platform integrates with Solana wallets:

1. **Wallet Linking**:
   - Users must link their Twitter account with a Solana wallet
   - Wallet addresses are stored and associated with user accounts

2. **Access Control**:
   - `WalletGuard` ensures users have linked wallets before accessing certain features
   - Wallet verification ensures the connected wallet matches the linked wallet

3. **Wallet Verification Flow**:
   - User connects wallet on frontend
   - Backend verifies and links the wallet to the user account
   - Session is updated with wallet information

## Database Models

### User Entity

```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  xId: string;  // Twitter user ID

  @Column({ nullable: true })
  username: string;

  @Column({ nullable: true })
  displayName: string;

  @Column({ nullable: true })
  walletAddress: string;

  // Other user fields...
}
```

### Game Room Entity

```typescript
@Entity()
export class GameRoom {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  creatorId: string;  // Twitter ID (xId) of creator

  // Parameters for the game room
  @Column({ type: 'float', default: 1 })
  bountyAmount: number;

  @Column({ default: 30 })
  timeLimit: number;

  @Column({ default: 5 })
  baseFeePercentage: number;

  // Relations
  @OneToMany(() => Message, message => message.gameRoom)
  messages: Message[];
}
```

### Message Entity

```typescript
@Entity()
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string;

  @Column()
  senderId: string;  // Twitter ID (xId) of sender

  @Column()
  senderName: string;

  @ManyToOne(() => GameRoom, gameRoom => gameRoom.messages)
  @JoinColumn({ name: 'gameRoomId' })
  gameRoom: GameRoom;

  @Column()
  gameRoomId: string;

  @CreateDateColumn()
  createdAt: Date;
}
```

## API Endpoints

### Authentication

- `GET /auth/login/twitter`: Initiate Twitter OAuth login
- `GET /auth/callback`: OAuth callback endpoint
- `GET /auth/user`: Get current authenticated user
- `GET /auth/logout`: Log out user

### User Management

- `POST /users`: Create a new user
- `GET /users/:id`: Get user by internal ID
- `GET /users/x/:xId`: Get user by Twitter ID
- `PUT /users/wallet`: Link a wallet to user account
- `GET /users/wallet/:address`: Find user by wallet address

### Game Rooms

- `GET /gamerooms`: List all game rooms
- `GET /gamerooms/:id`: Get a specific game room
- `POST /gamerooms`: Create a new game room (requires auth and wallet)
- `GET /gamerooms/:id/messages`: Get a game room with its messages

### Messages

- `GET /messages/gameroom/:gameRoomId`: Get messages for a game room
- `POST /messages`: Send a new message

## Security Considerations

The application implements several security mechanisms:

1. **Authentication Guards**: Protects routes requiring user authentication
2. **Wallet Guards**: Ensures users have linked wallets for specific actions
3. **CORS Configuration**: Controls which domains can access the API
4. **Session Security**: Properly configured session cookies
5. **Input Validation**: DTOs and validation pipes ensure data integrity 