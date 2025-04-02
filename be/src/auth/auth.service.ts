import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as OAuth from 'oauth-1.0a';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(private configService: ConfigService) {}

  // In-memory token storage as a fallback
  private static tokenSecrets: Map<string, string> = new Map();
  
  // Store a token secret
  storeTokenSecret(token: string, secret: string) {
    AuthService.tokenSecrets.set(token, secret);
    console.log(`[TOKEN_STORE] Stored secret for token: ${token.substring(0, 5)}...`);
  }
  
  // Retrieve a token secret
  getTokenSecret(token: string): string | undefined {
    const secret = AuthService.tokenSecrets.get(token);
    console.log(`[TOKEN_STORE] Retrieved secret for token: ${token.substring(0, 5)}..., exists: ${!!secret}`);
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
    
    console.log('[GET_REQUEST_TOKEN] Using callback URL:', callback);
    console.log('[GET_REQUEST_TOKEN] Environment:', process.env.NODE_ENV || 'development');
    
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
    console.log('[GET_REQUEST_TOKEN] Request headers:', headers);
    console.log('[GET_REQUEST_TOKEN] Authorization parameters:', authorization);

    try {
      // Format the request body properly
      const requestParams = new URLSearchParams();
      requestParams.append('oauth_callback', callback);
      
      console.log('[GET_REQUEST_TOKEN] Making request to Twitter API');
      console.log('[GET_REQUEST_TOKEN] Request body:', requestParams.toString());
      
      const response = await fetch(requestData.url, {
        method: requestData.method,
        headers: {
          ...headers,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: requestParams.toString(),
      });

      console.log('[GET_REQUEST_TOKEN] Response status:', response.status);
      console.log('[GET_REQUEST_TOKEN] Response headers:', JSON.stringify(response.headers, null, 2));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[GET_REQUEST_TOKEN] Twitter API Error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
      }

      const data = await response.text();
      console.log('[GET_REQUEST_TOKEN] Raw response data:', data);
      
      const parsedData = new URLSearchParams(data);
      const oauth_token = parsedData.get('oauth_token');
      const oauth_token_secret = parsedData.get('oauth_token_secret');
      
      console.log('[GET_REQUEST_TOKEN] Parsed response:', {
        has_oauth_token: oauth_token ? 'YES' : 'NO',
        has_oauth_token_secret: oauth_token_secret ? 'YES' : 'NO',
        oauth_token_length: oauth_token ? oauth_token.length : 0,
        oauth_token_secret_length: oauth_token_secret ? oauth_token_secret.length : 0,
      });

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
      
      return userData;
    } catch (error) {
      console.error('[GET_ACCESS_TOKEN] Error getting access token:', error);
      throw error;
    }
  }
}
