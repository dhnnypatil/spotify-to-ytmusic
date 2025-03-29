const SpotifyWebApi = require('spotify-web-api-node');
const User = require('../models/User.model');
const { getSpotifyApi } = require('../services/spotify/spotifyAPI.service');

// Initialize Spotify API client
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI
});

// Initiate Spotify OAuth flow
exports.initiateSpotifyAuth = (req, res) => {
  try {
    const userId = req.user.id;
    
    // Set state parameter for security (can include user ID for validation in callback)
    const state = Buffer.from(JSON.stringify({ userId })).toString('base64');
    
    // Define scopes (permissions)
    const scopes = [
      'user-read-private',
      'user-read-email',
      'playlist-read-private',
      'playlist-read-collaborative'
    ];
    
    // Get authorization URL
    const authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);
    
    res.json({ url: authorizeURL });
  } catch (error) {
    console.error('Spotify auth initiation error:', error);
    res.status(500).json({ message: 'Error initiating Spotify authentication' });
  }
};

// Handle Spotify OAuth callback
exports.spotifyCallback = async (req, res) => {
  try {
    const { code, state } = req.query;
    
    if (!code) {
      return res.status(400).redirect(`${process.env.FRONTEND_URL}/spotify?error=missing_code`);
    }
    
    // Validate state parameter
    const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
    const userId = stateData.userId;
    
    // Exchange code for tokens
    const data = await spotifyApi.authorizationCodeGrant(code);
    
    // Extract tokens
    const { access_token, refresh_token, expires_in } = data.body;
    
    // Set tokens on API instance
    spotifyApi.setAccessToken(access_token);
    spotifyApi.setRefreshToken(refresh_token);
    
    // Get user info from Spotify
    const spotifyUser = await spotifyApi.getMe();
    
    // Update user in database
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + expires_in);
    
    await User.findByIdAndUpdate(userId, {
      'spotify.connected': true,
      'spotify.accessToken': access_token,
      'spotify.refreshToken': refresh_token,
      'spotify.expiresAt': expiresAt,
      'spotify.userId': spotifyUser.body.id
    });
    
    // Redirect back to frontend
    res.redirect(`${process.env.FRONTEND_URL}/spotify?success=true`);
  } catch (error) {
    console.error('Spotify callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/spotify?error=authentication_failed`);
  }
};
