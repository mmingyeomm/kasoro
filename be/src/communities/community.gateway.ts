import { 
  WebSocketGateway, 
  WebSocketServer, 
  SubscribeMessage, 
  OnGatewayConnection, 
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Inject, forwardRef } from '@nestjs/common';
import { CommunityService } from './community.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  namespace: 'communities',
})
export class CommunityGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(CommunityGateway.name);
  private readonly roomClients = new Map<string, Set<string>>();

  @WebSocketServer()
  server: Server;

  constructor(
    @Inject(forwardRef(() => CommunityService))
    private readonly communityService: CommunityService
  ) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    // Remove client from all rooms they were in
    this.roomClients.forEach((clients, roomId) => {
      if (clients.has(client.id)) {
        clients.delete(client.id);
        this.logger.log(`Client ${client.id} removed from room ${roomId}`);
      }
    });
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string,
  ) {
    try {
      // Join Socket.IO room
      client.join(`room:${roomId}`);
      
      // Track clients in the room
      if (!this.roomClients.has(roomId)) {
        this.roomClients.set(roomId, new Set());
      }
      const clientsInRoom = this.roomClients.get(roomId);
      if (clientsInRoom) {
        clientsInRoom.add(client.id);
      }
      
      this.logger.log(`Client ${client.id} joined room ${roomId}`);
      
      // Send current lastMessageTime to the client
      const community = await this.communityService.getCommunityById(roomId);
      return {
        event: 'roomJoined',
        data: {
          roomId,
          lastMessageTime: community.lastMessageTime || null,
          clientCount: this.roomClients.get(roomId)?.size || 0,
        },
      };
    } catch (error) {
      this.logger.error(`Error joining room: ${error.message}`);
      return {
        event: 'error',
        data: {
          message: 'Failed to join room',
        },
      };
    }
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string,
  ) {
    // Leave Socket.IO room
    client.leave(`room:${roomId}`);
    
    // Remove client from tracked room
    const clientsInRoom = this.roomClients.get(roomId);
    if (clientsInRoom) {
      clientsInRoom.delete(client.id);
    }
    
    this.logger.log(`Client ${client.id} left room ${roomId}`);
    
    return {
      event: 'roomLeft',
      data: {
        roomId,
        clientCount: this.roomClients.get(roomId)?.size || 0,
      },
    };
  }

  // Method to broadcast lastMessageTime update to all clients in a room
  async broadcastLastMessageUpdate(roomId: string, timestamp: Date) {
    this.logger.log(`Broadcasting lastMessageTime update for room ${roomId}: ${timestamp}`);
    
    this.server.to(`room:${roomId}`).emit('lastMessageTimeUpdated', {
      roomId,
      lastMessageTime: timestamp,
    });
  }

  // Add a method to broadcast deposit updates
  broadcastDeposit(communityId: string, depositAmount: number, depositorUsername: string) {
    const room = `community_${communityId}`;
    
    // Update client count for the room
    const clientCount = this.roomClients.get(room)?.size || 0;
    
    this.server.to(room).emit('depositUpdate', {
      communityId,
      depositAmount,
      depositorUsername,
      timestamp: new Date(),
      clientCount
    });
    
    this.logger.log(`Broadcast deposit update to room ${room}: ${depositAmount} SOL from ${depositorUsername}`);
  }
} 