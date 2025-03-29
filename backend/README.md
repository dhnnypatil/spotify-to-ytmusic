# Spotify to YouTube Music - Backend

This is the backend service for the Spotify to YouTube Music playlist transfer application.

## Technology Stack

- Node.js with Express.js
- MongoDB for storing user data and transfer history
- OAuth 2.0 for Spotify and YouTube Music authentication
- Redis for caching and rate limiting

## Features

- Spotify OAuth authentication
- YouTube Music authentication
- Playlist retrieval from Spotify
- Song matching algorithm to find equivalent tracks on YouTube Music
- Playlist creation on YouTube Music
- Transfer status tracking
- Rate limiting to comply with API restrictions

## Project Structure

```
backend/
├── config/             # Configuration files
├── controllers/        # Request handlers
├── middleware/         # Express middleware
├── models/             # Database models
├── routes/             # API routes
├── services/           # Business logic
│   ├── spotify/        # Spotify API integration
│   └── youtube/        # YouTube Music API integration
├── utils/              # Utility functions
├── .env.example        # Environment variables example
├── package.json        # Dependencies
└── server.js           # Entry point
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/auth/spotify | Initiate Spotify OAuth flow |
| GET | /api/auth/spotify/callback | Spotify OAuth callback |
| GET | /api/auth/youtube | Initiate YouTube Music OAuth flow |
| GET | /api/auth/youtube/callback | YouTube Music OAuth callback |
| GET | /api/spotify/playlists | Get user's Spotify playlists |
| POST | /api/transfer | Start transfer process |
| GET | /api/transfer/:id | Get transfer status |
| GET | /api/user/history | Get user's transfer history |

## Setup and Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file based on `.env.example`
4. Start the server: `npm start`

## Development

1. Start in development mode with hot reload: `npm run dev`
2. Run tests: `npm test`
3. Lint code: `npm run lint`

## Authentication

### Spotify
1. Register an application in the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)
2. Set the redirect URI to `http://localhost:5000/api/auth/spotify/callback`
3. Add your client ID and client secret to the `.env` file

### YouTube Music
1. Create a project in the [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the YouTube Data API v3
3. Create OAuth 2.0 credentials
4. Set the redirect URI to `http://localhost:5000/api/auth/youtube/callback`
5. Add your client ID and client secret to the `.env` file
