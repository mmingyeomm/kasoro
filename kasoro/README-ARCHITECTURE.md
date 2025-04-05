# Kasoro Frontend Architecture

This document provides an overview of the Kasoro frontend architecture, explaining the main components, their interactions, and the overall system design.

## Table of Contents

1. [Technology Stack](#technology-stack)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Authentication Flow](#authentication-flow)
5. [Wallet Integration](#wallet-integration)
6. [Community & Messaging UI](#game-room--messaging-ui)
7. [State Management](#state-management)
8. [Styling Approach](#styling-approach)

## Technology Stack

The frontend is built with the following technologies:

- **Next.js**: React framework for production with server-side rendering
- **React**: UI library for building component-based interfaces
- **TypeScript**: Typed superset of JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Solana Web3.js**: Solana blockchain integration
- **Wallet Adapter**: For Solana wallet connections

## Project Structure

The codebase follows Next.js 13+ app directory structure:

- `src/`: Main source code directory
  - `app/`: Next.js app directory
    - `page.tsx`: Home page
    - `auth-success/`: Authentication success page
    - `communities/`: Comunities pages
    - `login-error/`: Login error page
  - `components/`: Reusable React components
  - `public/`: Static assets
  - `styles/`: Global styles

## Core Components

### Layout Components

- **Layout Component**: Main layout wrapper with navigation and providers
- **WalletButton**: Component for connecting to Solana wallets
- **LinkWalletButton**: Component for linking Twitter and wallet accounts

### Community Components

- **CommunityList**: Displays list of available comunities
- **CreateCommunityForm**: Form for creating new comunities with parameters
  - Bounty amount slider
  - Time limit slider
  - Base fee percentage slider

### Message Components

- **MessageList**: Displays messages in a community
- **CreateMessageForm**: Input for sending new messages

## Authentication Flow

The Kasoro application uses Twitter OAuth for authentication:

1. **Login Initiation**:

   - User clicks "Login with X" button
   - Redirected to Twitter OAuth endpoint

2. **OAuth Callback**:

   - After successful Twitter auth, redirected to `/auth-success`
   - Frontend fetches user details from backend
   - User state is updated in the application

3. **Session Management**:
   - User session is maintained via cookies
   - Authentication state is checked on protected pages

## Wallet Integration

The platform integrates with Solana wallets:

1. **Wallet Connection**:

   - Users connect their Solana wallet using the WalletButton component
   - Connection state is managed by the Solana Wallet Adapter

2. **Wallet Linking**:

   - Once connected, users link their wallet to their Twitter account
   - LinkWalletButton component manages this process
   - After linking, the wallet address is stored in the user profile

3. **Wallet Verification**:
   - The application verifies that the connected wallet matches the linked wallet
   - This verification is required for creating comunities

## Community & Messaging UI

### Community Creation

The CreateCommunityForm component includes:

- Room name and description inputs
- Bounty amount slider (SOL)
- Time limit slider (minutes)
- Base fee percentage slider

### Community List

The CommunityList component:

- Displays available comunities in a visually appealing layout
- Shows parameters for each room (bounty, time limit)
- Provides navigation to individual comunities

### Messaging System

The messaging UI includes:

- Real-time message display
- Message composition and sending
- User attribution for messages

## State Management

The application uses:

1. **React State and Hooks**:

   - Local component state with useState
   - Side effects with useEffect

2. **Context API**:

   - For global state like user authentication
   - Wallet connection state

3. **Server State**:
   - Data fetching from the backend
   - Error handling and loading states

## Styling Approach

The application uses:

1. **Tailwind CSS**:

   - Utility-first approach
   - Consistent design system
   - Dark mode support

2. **Custom Components**:

   - Pixel art aesthetic
   - Retro-style UI elements
   - Responsive design for various screen sizes

3. **Theme**:
   - Black borders and colorful indicators
   - Specific color coding for different types of data:
     - Yellow for SOL values
     - Green for time limits
     - Red for fees
