import { Controller, Get, Query, Res, Session, Req } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('login/twitter')
  async twitterLogin(@Res() res: Response, @Session() session: Record<string, any>) {
    try {
      
      // Clear any existing oauth data to prevent issues
      if (session.oauth_token_secret) {
        console.log('[AUTH] Found existing oauth_token_secret in session, clearing it');
        delete session.oauth_token_secret;
      }
      
      const { oauth_token, oauth_token_secret } = await this.authService.getRequestToken();
      console.log('[AUTH] Received tokens:', { 
        oauth_token, 
        oauth_token_secret_length: oauth_token_secret ? oauth_token_secret.length : 0,
        oauth_token_secret_present: oauth_token_secret ? 'YES' : 'NO',
      });
      
      // Store the token secret in the session
      session.oauth_token_secret = oauth_token_secret;
      
      // Log after setting to verify it was stored
      console.log('[AUTH] Session after storing token:', {
        has_oauth_token_secret: session.oauth_token_secret ? 'YES' : 'NO',
        session_id: session.id,
      });
      
      // Force session save (implementation may vary)
      if (res.req.session.save) {
        console.log('[AUTH] Explicitly saving session...');
        await new Promise<void>((resolve, reject) => {
          res.req.session.save((err) => {
            if (err) {
              console.error('[AUTH] Error saving session:', err);
              reject(err);
            } else {
              console.log('[AUTH] Session explicitly saved successfully');
              resolve();
            }
          });
        });
      } else {
        console.log('[AUTH] No session.save method available');
      }
      
      // We've already stored the token secret in our service's in-memory storage
      // No need to pass it as a state parameter since Twitter seems to strip it
      
      // Redirect to Twitter for authentication
      const redirectUrl = `https://api.twitter.com/oauth/authenticate?oauth_token=${oauth_token}`;
      console.log('[AUTH] Redirecting to:', redirectUrl);
      
      return res.redirect(redirectUrl);
    } catch (error) {
      console.error('[AUTH] Twitter login error:', error);
      const frontendUrl = process.env.NODE_ENV === 'production' 
        ? 'https://kasoro.vercel.app'
        : 'http://localhost:3000';
      return res.redirect(`${frontendUrl}/login-error`);
    }
  }

  @Get('callback')
  async twitterCallback(
    @Query('oauth_token') oauth_token: string,
    @Query('oauth_verifier') oauth_verifier: string,
    @Query('state') state: string,
    @Session() session: Record<string, any>,
    @Res() res: Response,
  ) {
    try {

      // Try to get the token secret from both the session and in-memory storage
      let oauth_token_secret = session.oauth_token_secret;
      
      // If not in session, try to get it from the in-memory storage
      if (!oauth_token_secret) {
        console.log('[CALLBACK] Trying to get token secret from in-memory storage');
        oauth_token_secret = this.authService.getTokenSecret(oauth_token);
      }
      
      console.log('[CALLBACK] Retrieved oauth_token_secret:', { 
        from_session: session.oauth_token_secret ? 'YES' : 'NO',
        from_memory: !!this.authService.getTokenSecret(oauth_token),
        has_oauth_token_secret: oauth_token_secret ? 'YES' : 'NO',
        oauth_token_secret_length: oauth_token_secret ? oauth_token_secret.length : 0
      });
      
      if (!oauth_token_secret) {
        const err = new Error('Missing oauth_token_secret in both session and in-memory storage');
        console.error('[CALLBACK] ERROR:', err);
        throw err;
      }
      
      console.log('[CALLBACK] Will exchange token with data:', {
        oauth_token,
        oauth_verifier,
        oauth_token_secret_length: oauth_token_secret.length,
      });
      
      // Exchange the request token for an access token
      const userData = await this.authService.getAccessToken(oauth_token, oauth_verifier, oauth_token_secret);
      
      // Log user data
      console.log('[CALLBACK] User successfully logged in:', {
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
      
      console.log('[CALLBACK] Stored user data in session:', {
        user_id: userData.user_id,
        session_id: session.id,
      });
      
      // Clear the temporary oauth_token_secret
      delete session.oauth_token_secret;
      
      // Force session save
      if (res.req.session.save) {
        console.log('[CALLBACK] Explicitly saving session...');
        await new Promise<void>((resolve, reject) => {
          res.req.session.save((err) => {
            if (err) {
              console.error('[CALLBACK] Error saving session:', err);
              reject(err);
            } else {
              console.log('[CALLBACK] Session explicitly saved successfully');
              resolve();
            }
          });
        });
      } else {
        console.log('[CALLBACK] No session.save method available');
      }
      
      // Redirect to frontend with success
      console.log('[CALLBACK] Redirecting to success page');
      const frontendUrl = process.env.NODE_ENV === 'production' 
        ? 'https://kasoro.vercel.app'
        : 'http://localhost:3000';
      return res.redirect(`${frontendUrl}/auth-success`);
    } catch (error) {
      console.error('[CALLBACK] Twitter callback error:', error);
      const frontendUrl = process.env.NODE_ENV === 'production' 
        ? 'https://kasoro.vercel.app'
        : 'http://localhost:3000';
      return res.redirect(`${frontendUrl}/login-error`);
    }
  }

  @Get('user')
  getUser(@Session() session: Record<string, any>, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    console.log('User session data requested, returning:', session.user ? { id: session.user.id, username: session.user.username, walletAddress: session.user.walletAddress } : 'No user');

    // Set CORS headers to allow any origin
    const origin = req.headers.origin || '*';
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // Always return a valid JSON object
    return session.user ? {
      id: session.user.id,
      username: session.user.username,
      walletAddress: session.user.walletAddress || null
    } : { loggedIn: false };
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
    const frontendUrl = process.env.NODE_ENV === 'production' 
      ? 'https://kasoro.vercel.app'
      : 'http://localhost:3000';
    return res.redirect(frontendUrl);
  }
}
