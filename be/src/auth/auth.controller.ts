import { Controller, Get, Query, Res, Session } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('login/twitter')
  async twitterLogin(@Res() res: Response, @Session() session: Record<string, any>) {
    try {
      console.log('Starting Twitter login process...');
      
      // Check if we need to test the API directly
      console.log('Session:', session);
      
      const { oauth_token, oauth_token_secret } = await this.authService.getRequestToken();
      console.log('Received tokens:', { oauth_token, oauth_token_secret: oauth_token_secret ? 'PRESENT' : 'MISSING' });
      
      // Store the token secret in the session
      session.oauth_token_secret = oauth_token_secret;
      
      // Redirect to Twitter for authentication
      const redirectUrl = `https://api.twitter.com/oauth/authenticate?oauth_token=${oauth_token}`;
      console.log('Redirecting to:', redirectUrl);
      
      return res.redirect(redirectUrl);
    } catch (error) {
      console.error('Twitter login error:', error);
      return res.redirect('http://localhost:3000/login-error');
    }
  }

  @Get('callback')
  async twitterCallback(
    @Query('oauth_token') oauth_token: string,
    @Query('oauth_verifier') oauth_verifier: string,
    @Session() session: Record<string, any>,
    @Res() res: Response,
  ) {
    try {
      console.log('Callback received with params:', { oauth_token, oauth_verifier });
      
      // Get the token secret from the session
      const oauth_token_secret = session.oauth_token_secret;
      
      if (!oauth_token_secret) {
        throw new Error('Missing oauth_token_secret in session');
      }
      
      // Exchange the request token for an access token
      const userData = await this.authService.getAccessToken(oauth_token, oauth_verifier, oauth_token_secret);
      
      // Log user data
      console.log('User successfully logged in:', {
        id: userData.user_id,
        username: userData.screen_name,
        timestamp: new Date().toISOString()
      });
      
      // Store user data in session or send to frontend
      session.user = {
        id: userData.user_id,
        username: userData.screen_name,
        oauth_token: userData.oauth_token,
        oauth_token_secret: userData.oauth_token_secret,
      };
      
      // Clear the temporary oauth_token_secret
      delete session.oauth_token_secret;
      
      // Redirect to frontend with success
      return res.redirect('http://localhost:3000/auth-success');
    } catch (error) {
      console.error('Twitter callback error:', error);
      return res.redirect('http://localhost:3000/login-error');
    }
  }

  @Get('user')
  getUser(@Session() session: Record<string, any>) {
    console.log('User session data requested, returning:', session.user ? { id: session.user.id, username: session.user.username } : 'No user');
    return session.user || null;
  }
  
  @Get('debug')
  getDebugInfo(@Session() session: Record<string, any>) {
    const sanitizedSession = { ...session };
    
    // Remove sensitive data before logging
    if (sanitizedSession.user) {
      sanitizedSession.user = {
        id: sanitizedSession.user.id,
        username: sanitizedSession.user.username,
        hasToken: !!sanitizedSession.user.oauth_token,
        hasSecret: !!sanitizedSession.user.oauth_token_secret,
      };
    }
    
    console.log('Full session debug requested:', sanitizedSession);
    
    return {
      sessionExists: !!session,
      userLoggedIn: !!session.user,
      userData: session.user ? {
        id: session.user.id,
        username: session.user.username,
      } : null,
      sessionKeys: Object.keys(session),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('logout')
  logout(@Session() session: Record<string, any>, @Res() res: Response) {
    session.user = null;
    return res.redirect('http://localhost:3000');
  }
}
