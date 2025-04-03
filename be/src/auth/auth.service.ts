import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as OAuth from 'oauth-1.0a';
import * as crypto from 'crypto';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private userService: UserService
  ) {}

  // In-memory token storage as a fallback
  private static tokenSecrets: Map<string, string> = new Map();
  
  // Store a token secret
  storeTokenSecret(token: string, secret: string) {
    AuthService.tokenSecrets.set(token, secret);
  }
  
  // Retrieve a token secret
  getTokenSecret(token: string): string | undefined {
    const secret = AuthService.tokenSecrets.get(token);
    return secret;
  }
  
  private getOAuthInstance() {
    const key = this.configService.get<string>('API_KEY');
    const secret = this.configService.get<string>('API_KEY_SECRET');
    
    if (!key || !secret) {
      throw new Error('Missing required API_KEY or API_KEY_SECRET environment variables');
    }
    
    console.log('Using API credentials:', { key, secret: secret.substring(0, 5) + '...' });
    
    return new OAuth({
      consumer: {
        key,
        secret,
      },
      signature_method: 'HMAC-SHA1',
      hash_function(baseString, key) {
        return crypto
          .createHmac('sha1', key)
          .update(baseString)
          .digest('base64');
      },
    });
  }

  async getRequestToken() {
    console.log('[GET_REQUEST_TOKEN] Starting to get request token from Twitter');
    
    const oauth = this.getOAuthInstance();
    
    // Use the appropriate callback URL based on environment
    const isProduction = process.env.NODE_ENV === 'production';
    const callback = isProduction
      ? 'http://kasoro.onrender.com/auth/callback'
      : 'http://localhost:3001/auth/callback';
  
    // OAuth 1.0a parameters must be included in both the signature and the request
    const requestData = {
      url: 'https://api.twitter.com/oauth/request_token',
      method: 'POST',
      data: { oauth_callback: callback },
    };

    // Get authorization headers including the OAuth signature
    console.log('[GET_REQUEST_TOKEN] Generating OAuth authorization');
    const authorization = oauth.authorize(requestData);
    const headers = oauth.toHeader(authorization);

    try {
      // Format the request body properly
      const requestParams = new URLSearchParams();
      requestParams.append('oauth_callback', callback);

      const response = await fetch(requestData.url, {
        method: requestData.method,
        headers: {
          ...headers,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: requestParams.toString(),
      });


      if (!response.ok) {
        const errorText = await response.text();
        console.error('[GET_REQUEST_TOKEN] Twitter API Error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
      }

      const data = await response.text();
      
      const parsedData = new URLSearchParams(data);
      const oauth_token = parsedData.get('oauth_token');
      const oauth_token_secret = parsedData.get('oauth_token_secret');

      // Store the secret in our in-memory cache
      if (oauth_token && oauth_token_secret) {
        this.storeTokenSecret(oauth_token, oauth_token_secret);
      }
      
      return { oauth_token, oauth_token_secret };
    } catch (error) {
      console.error('[GET_REQUEST_TOKEN] Error getting request token:', error);
      throw error;
    }
  }

  async getAccessToken(oauth_token: string, oauth_verifier: string, oauth_token_secret: string) {
    console.log('[GET_ACCESS_TOKEN] Starting to exchange tokens');
    console.log('[GET_ACCESS_TOKEN] Input parameters:', {
      oauth_token,
      oauth_verifier,
      oauth_token_secret_length: oauth_token_secret ? oauth_token_secret.length : 0,
      has_token_secret: oauth_token_secret ? 'YES' : 'NO',
    });
    
    const oauth = this.getOAuthInstance();
    const requestData = {
      url: 'https://api.twitter.com/oauth/access_token',
      method: 'POST',
      data: { oauth_token, oauth_verifier },
    };

    console.log('[GET_ACCESS_TOKEN] Request data:', requestData);

    // Generate authorization with token from the login step
    console.log('[GET_ACCESS_TOKEN] Generating OAuth authorization with token secret');
    const authorization = oauth.authorize(requestData, { key: oauth_token, secret: oauth_token_secret });
    const headers = oauth.toHeader(authorization);
    console.log('[GET_ACCESS_TOKEN] Authorization headers:', headers);

    try {
      // Format the request body properly
      const requestParams = new URLSearchParams();
      requestParams.append('oauth_token', oauth_token);
      requestParams.append('oauth_verifier', oauth_verifier);
      
      console.log('[GET_ACCESS_TOKEN] Making request to Twitter API');
      console.log('[GET_ACCESS_TOKEN] Request body:', requestParams.toString());
      
      const response = await fetch(requestData.url, {
        method: requestData.method,
        headers: {
          ...headers,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: requestParams.toString(),
      });

      console.log('[GET_ACCESS_TOKEN] Response status:', response.status);
      console.log('[GET_ACCESS_TOKEN] Response headers:', JSON.stringify(response.headers, null, 2));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[GET_ACCESS_TOKEN] Twitter API Error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
      }

      const data = await response.text();
      console.log('[GET_ACCESS_TOKEN] Raw response:', data);
      
      const parsedData = new URLSearchParams(data);
      
      // Log the parsed data without exposing sensitive details
      console.log('[GET_ACCESS_TOKEN] Parsed data keys:', Array.from(parsedData.keys()));
      
      const userData = {
        oauth_token: parsedData.get('oauth_token'),
        oauth_token_secret: parsedData.get('oauth_token_secret'),
        user_id: parsedData.get('user_id'),
        screen_name: parsedData.get('screen_name'),
      };
      
      console.log('[GET_ACCESS_TOKEN] User data extracted:', {
        has_oauth_token: userData.oauth_token ? 'YES' : 'NO',
        has_oauth_token_secret: userData.oauth_token_secret ? 'YES' : 'NO',
        user_id: userData.user_id,
        screen_name: userData.screen_name,
      });
      
      // Store user data in database
      try {
        if (userData.user_id && userData.screen_name) {
          await this.userService.create({
            xId: userData.user_id,
            username: userData.screen_name,
            displayName: userData.screen_name, // Twitter API v1 doesn't return display name, so using screen_name
          });
          console.log('[GET_ACCESS_TOKEN] User saved to database');
        } else {
          console.error('[GET_ACCESS_TOKEN] Missing required user data from Twitter API');
        }
      } catch (error) {
        console.error('[GET_ACCESS_TOKEN] Error saving user to database:', error);
        // Continue even if database save fails
      }
      
      return userData;
    } catch (error) {
      console.error('[GET_ACCESS_TOKEN] Error getting access token:', error);
      throw error;
    }
  }
}
