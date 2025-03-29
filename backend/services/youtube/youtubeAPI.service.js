const { google } = require('googleapis');
const User = require('../../models/User.model');

// Get YouTube API instance with user's tokens
exports.getYouTubeApi = async (userId) => {
  try {
    // Find user to get tokens
    const user = await User.findById(userId);
    
    if (!user || !user.youtube.connected) {
      throw new Error('User not connected to YouTube Music');
    }
    
    // Initialize OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.YOUTUBE_CLIENT_ID,
      process.env.YOUTUBE_CLIENT_SECRET,
      process.env.YOUTUBE_REDIRECT_URI
    );
    
    // Set tokens
    oauth2Client.setCredentials({
      access_token: user.youtube.accessToken,
      refresh_token: user.youtube.refreshToken,
      expiry_date: new Date(user.youtube.expiresAt).getTime()
    });
    
    // Check if token is expired and refresh if needed
    if (new Date() >= new Date(user.youtube.expiresAt)) {
      await refreshYouTubeToken(oauth2Client, user);
    }
    
    // Initialize YouTube API
    const youtube = google.youtube({
      version: 'v3',
      auth: oauth2Client
    });
    
    return { youtube, oauth2Client };
  } catch (error) {
    console.error('Error getting YouTube API:', error);
    throw error;
  }
};

// Refresh YouTube access token
const refreshYouTubeToken = async (oauth2Client, user) => {
  try {
    const { credentials } = await oauth2Client.refreshAccessToken();
    
    // Update tokens in DB
    await User.findByIdAndUpdate(user._id, {
      'youtube.accessToken': credentials.access_token,
      'youtube.expiresAt': new Date(credentials.expiry_date)
    });
    
    // Update tokens in OAuth client
    oauth2Client.setCredentials(credentials);
    
    return oauth2Client;
  } catch (error) {
    console.error('Error refreshing YouTube token:', error);
    throw error;
  }
};

// Create a new playlist on YouTube
exports.createPlaylist = async (userId, playlistName, description) => {
  try {
    const { youtube } = await this.getYouTubeApi(userId);
    
    const response = await youtube.playlists.insert({
      part: 'snippet,status',
      requestBody: {
        snippet: {
          title: playlistName,
          description: description || `Transferred from Spotify: ${playlistName}`,
          tags: ['spotify', 'transfer', 'music']
        },
        status: {
          privacyStatus: 'private'
        }
      }
    });
    
    return {
      id: response.data.id,
      name: response.data.snippet.title
    };
  } catch (error) {
    console.error('Error creating YouTube playlist:', error);
    throw error;
  }
};

// Search for a track on YouTube
exports.searchTrack = async (userId, query) => {
  try {
    const { youtube } = await this.getYouTubeApi(userId);
    
    const response = await youtube.search.list({
      part: 'snippet',
      q: query,
      type: 'video',
      maxResults: 5,
      videoEmbeddable: true,
      videoCategoryId: '10' // Music category
    });
    
    return response.data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.high.url
    }));
  } catch (error) {
    console.error('Error searching YouTube track:', error);
    throw error;
  }
};

// Add track to playlist
exports.addTrackToPlaylist = async (userId, playlistId, videoId) => {
  try {
    const { youtube } = await this.getYouTubeApi(userId);
    
    await youtube.playlistItems.insert({
      part: 'snippet',
      requestBody: {
        snippet: {
          playlistId: playlistId,
          resourceId: {
            kind: 'youtube#video',
            videoId: videoId
          }
        }
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error adding track to YouTube playlist:', error);
    throw error;
  }
};

// Get user's playlists
exports.getUserPlaylists = async (userId) => {
  try {
    const { youtube } = await this.getYouTubeApi(userId);
    
    const response = await youtube.playlists.list({
      part: 'snippet,contentDetails',
      mine: true,
      maxResults: 50
    });
    
    let playlists = response.data.items;
    let nextPageToken = response.data.nextPageToken;
    
    while (nextPageToken) {
      const moreResponse = await youtube.playlists.list({
        part: 'snippet,contentDetails',
        mine: true,
        maxResults: 50,
        pageToken: nextPageToken
      });
      
      playlists = [...playlists, ...moreResponse.data.items];
      nextPageToken = moreResponse.data.nextPageToken;
    }
    
    return playlists.map(playlist => ({
      id: playlist.id,
      name: playlist.snippet.title,
      description: playlist.snippet.description,
      tracksCount: playlist.contentDetails.itemCount,
      thumbnail: playlist.snippet.thumbnails.high ? playlist.snippet.thumbnails.high.url : null
    }));
  } catch (error) {
    console.error('Error getting YouTube playlists:', error);
    throw error;
  }
};
