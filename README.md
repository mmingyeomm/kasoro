# Seoulana Project

This project demonstrates OAuth 1.0a authentication with X (Twitter) using a NestJS backend and Next.js frontend.

## Project Structure

- `/be` - NestJS backend application with OAuth 1.0a implementation
- `/kasoro` - Next.js frontend application with X login button

## Backend Configuration

1. Create a `.env` file in the `/be` directory with:

```
API_KEY=your_x_api_key
API_KEY_SECRET=your_x_api_key_secret
FRONTEND_URL=https://your-frontend-url.com
```

2. Run the backend:

```bash
cd be
npm install
npm run start:dev
```

## Frontend Configuration

1. Create a `.env.local` file in the `/kasoro` directory with:

```
NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.com
```

2. Run the frontend:

```bash
cd kasoro
npm install
npm run dev
```

## Deployment Notes

When deploying to production:

1. Make sure to set the correct URLs in both backend and frontend environments
2. Update your X Developer Portal settings with the correct callback URL
3. Configure proper CORS settings in the backend if you're using a different domain

## Troubleshooting CORS Issues

If you encounter CORS errors:

1. Check that your backend's CORS configuration includes your frontend's domain
2. Ensure that credentials are handled properly (both allowed on server and included in requests)
3. For browser cookie issues, verify that sameSite and secure settings are appropriate for your deployment

## Authentication Flow

1. User clicks "Login with X" button on frontend
2. Backend requests OAuth token from X
3. User is redirected to X for authentication
4. X redirects back to backend with verification
5. Backend exchanges for access token and stores user data
6. User is redirected to frontend success page which displays their X info