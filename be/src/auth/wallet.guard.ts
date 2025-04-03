import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class WalletGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const session = request.session as any;

    if (!session || !session.user) {
      throw new UnauthorizedException('You must be logged in to access this resource');
    }

    if (!session.user.walletAddress) {
      throw new UnauthorizedException('You must link your wallet to access this resource');
    }

    return true;
  }
} 