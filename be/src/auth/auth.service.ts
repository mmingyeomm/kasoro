import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as OAuth from 'oauth-1.0a';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(private configService: ConfigService) {}

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
    const oauth = this.getOAuthInstance();
    const callback = 'http://localhost:3001/auth/callback';
    
    // OAuth 1.0a parameters must be included in both the signature and the request
    const requestData = {
      url: 'https://api.twitter.com/oauth/request_token',
      method: 'POST',
      data: { oauth_callback: callback },
    };

    // Get authorization headers including the OAuth signature
    const authorization = oauth.authorize(requestData);
    const headers = oauth.toHeader(authorization);
    console.log('Request headers:', headers);
    console.log('Authorization:', authorization);

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
        console.error('Twitter API Error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
      }

      const data = await response.text();
      const parsedData = new URLSearchParams(data);
      const oauth_token = parsedData.get('oauth_token');
      const oauth_token_secret = parsedData.get('oauth_token_secret');

      return { oauth_token, oauth_token_secret };
    } catch (error) {
      console.error('Error getting request token:', error);
      throw error;
    }
  }

  async getAccessToken(oauth_token: string, oauth_verifier: string, oauth_token_secret: string) {
    const oauth = this.getOAuthInstance();
    const requestData = {
      url: 'https://api.twitter.com/oauth/access_token',
      method: 'POST',
      data: { oauth_token, oauth_verifier },
    };

    console.log('Exchanging request token for access token:', { oauth_token, oauth_verifier });

    const authorization = oauth.authorize(requestData, { key: oauth_token, secret: oauth_token_secret });
    const headers = oauth.toHeader(authorization);

    try {
      // Format the request body properly
      const requestParams = new URLSearchParams();
      requestParams.append('oauth_token', oauth_token);
      requestParams.append('oauth_verifier', oauth_verifier);
      
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
        console.error('Twitter API Error (access token):', errorText);
        throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
      }

      const data = await response.text();
      console.log('Got access token response:', data);
      
      const parsedData = new URLSearchParams(data);
      const userData = {
        oauth_token: parsedData.get('oauth_token'),
        oauth_token_secret: parsedData.get('oauth_token_secret'),
        user_id: parsedData.get('user_id'),
        screen_name: parsedData.get('screen_name'),
      };
      
      console.log('User authenticated:', {
        user_id: userData.user_id,
        screen_name: userData.screen_name,
      });
      
      return userData;
    } catch (error) {
      console.error('Error getting access token:', error);
      throw error;
    }
  }
}
