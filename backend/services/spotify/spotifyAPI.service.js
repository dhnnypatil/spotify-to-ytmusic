const SpotifyWebApi = require('spotify-web-api-node');
const User = require('../../models/User.model');

// Get Spotify API instance with user's tokens
exports.getSpotifyApi = async (userId) => {
  try {
    // Find user to get tokens
    const user = await User.findById(userId);
    
    if (!user || !user.spotify.connected) {
      throw new Error('User not connected to Spotify');
    }
    
    // Initialize Spotify API
    const spotifyApi = new SpotifyWebApi({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      redirectUri: process.env.SPOTIFY_REDIRECT_URI
    });
    
    // Set tokens
    spotifyApi.setAccessToken(user.spotify.accessToken);
    spotifyApi.setRefreshToken(user.spotify.refreshToken);
    
    // Check if token is expired and refresh if needed
    if (new Date() >= new Date(user.spotify.expiresAt)) {
      await refreshSpotifyToken(spotifyApi, user);
    }
    
    return spotifyApi;
  } catch (error) {
    console.error('Error getting Spotify API:', error);
    throw error;
  }
};

// Refresh Spotify access token
const refreshSpotifyToken = async (spotifyApi, user) => {
  try {
    const data = await spotifyApi.refreshAccessToken();
    
    // Update tokens in DB
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + data.body.expires_in);
    
    await User.findByIdAndUpdate(user._id, {
      'spotify.accessToken': data.body.access_token,
      'spotify.expiresAt': expiresAt
    });
    
    // Update tokens in API instance
    spotifyApi.setAccessToken(data.body.access_token);
    
    return spotifyApi;
  } catch (error) {
    console.error('Error refreshing Spotify token:', error);
    throw error;
  }
};

// Get user's playlists
exports.getUserPlaylists = async (userId) => {
  try {
    const spotifyApi = await this.getSpotifyApi(userId);
    const data = await spotifyApi.getUserPlaylists({ limit: 50 });
    
    // Get more if there are more than 50 playlists
    let playlists = data.body.items;
    let offset = 50;
    
    while (data.body.next) {
      const morePlaylists = await spotifyApi.getUserPlaylists({ limit: 50, offset });
      playlists = [...playlists, ...morePlaylists.body.items];
      offset += 50;
      
      if (!morePlaylists.body.next) break;
    }
    
    return playlists.map(playlist => ({
      id: playlist.id,
      name: playlist.name,
      description: playlist.description,
      tracksCount: playlist.tracks.total,
      images: playlist.images,
      external_urls: playlist.external_urls,
      owner: playlist.owner
    }));
  } catch (error) {
    console.error('Error getting user playlists:', error);
    throw error;
  }
};

// Get playlist tracks
exports.getPlaylistTracks = async (userId, playlistId) => {
  try {
    const spotifyApi = await this.getSpotifyApi(userId);
    const data = await spotifyApi.getPlaylistTracks(playlistId, { limit: 100 });
    
    // Get more if there are more than 100 tracks
    let tracks = data.body.items;
    let offset = 100;
    
    while (data.body.next) {
      const moreTracks = await spotifyApi.getPlaylistTracks(playlistId, { limit: 100, offset });
      tracks = [...tracks, ...moreTracks.body.items];
      offset += 100;
      
      if (!moreTracks.body.next) break;
    }
    
    // Format tracks data
    return tracks.map(item => ({
      id: item.track.id,
      name: item.track.name,
      artists: item.track.artists.map(artist => artist.name),
      album: item.track.album.name,
      duration_ms: item.track.duration_ms,
      external_urls: item.track.external_urls,
      added_at: item.added_at
    }));
  } catch (error) {
    console.error('Error getting playlist tracks:', error);
    throw error;
  }
};

// Get playlist details
exports.getPlaylistDetails = async (userId, playlistId) => {
  try {
    const spotifyApi = await this.getSpotifyApi(userId);
    const data = await spotifyApi.getPlaylist(playlistId);
    
    return {
      id: data.body.id,
      name: data.body.name,
      description: data.body.description,
      tracksCount: data.body.tracks.total,
      images: data.body.images,
      external_urls: data.body.external_urls,
      owner: data.body.owner
    };
  } catch (error) {
    console.error('Error getting playlist details:', error);
    throw error;
  }
};
