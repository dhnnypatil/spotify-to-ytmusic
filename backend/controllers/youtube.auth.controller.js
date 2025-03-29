const { google } = require('googleapis');
const User = require('../models/User.model');

// Create OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.YOUTUBE_CLIENT_ID,
  process.env.YOUTUBE_CLIENT_SECRET,
  process.env.YOUTUBE_REDIRECT_URI
);

// Initiate YouTube Music OAuth flow
exports.initiateYouTubeAuth = (req, res) => {
  try {
    const userId = req.user.id;
    
    // Set state parameter for security
    const state = Buffer.from(JSON.stringify({ userId })).toString('base64');
    
    // Define scopes
    const scopes = [
      'https://www.googleapis.com/auth/youtube',
      'https://www.googleapis.com/auth/youtube.force-ssl'
    ];
    
    // Generate auth URL
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state: state,
      prompt: 'consent' // Force to get refresh_token
    });
    
    res.json({ url: authUrl });
  } catch (error) {
    console.error('YouTube auth initiation error:', error);
    res.status(500).json({ message: 'Error initiating YouTube authentication' });
  }
};

// Handle YouTube Music OAuth callback
exports.youtubeCallback = async (req, res) => {
  try {
    const { code, state } = req.query;
    
    if (!code) {
      return res.status(400).redirect(`${process.env.FRONTEND_URL}/ytmusic?error=missing_code`);
    }
    
    // Validate state parameter
    const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
    const userId = stateData.userId;
    
    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    const { access_token, refresh_token, expiry_date } = tokens;
    
    // Set credentials
    oauth2Client.setCredentials(tokens);
    
    // Get user info
    const youtube = google.youtube({
      version: 'v3',
      auth: oauth2Client
    });
    
    const response = await youtube.channels.list({
      part: 'snippet',
      mine: true
    });
    
    const channelId = response.data.items[0].id;
    
    // Update user in database
    await User.findByIdAndUpdate(userId, {
      'youtube.connected': true,
      'youtube.accessToken': access_token,
      'youtube.refreshToken': refresh_token,
      'youtube.expiresAt': new Date(expiry_date),
      'youtube.userId': channelId
    });
    
    // Redirect back to frontend
    res.redirect(`${process.env.FRONTEND_URL}/ytmusic?success=true`);
  } catch (error) {
    console.error('YouTube callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/ytmusic?error=authentication_failed`);
  }
};
