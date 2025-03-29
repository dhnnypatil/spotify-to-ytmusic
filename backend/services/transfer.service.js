const Transfer = require('../models/Transfer.model');
const TransferHistory = require('../models/TransferHistory.model');
const SpotifyService = require('./spotify/spotifyAPI.service');
const YouTubeService = require('./youtube/youtubeAPI.service');

class TransferService {
  constructor(userId) {
    this.userId = userId;
  }
  
  // Initialize transfer records
  async initializeTransfers(playlistIds) {
    try {
      const transfers = [];
      
      // Get details for each playlist
      for (const playlistId of playlistIds) {
        const playlistDetails = await SpotifyService.getPlaylistDetails(this.userId, playlistId);
        
        // Create transfer record
        const transfer = await Transfer.create({
          user: this.userId,
          spotifyPlaylistId: playlistId,
          spotifyPlaylistName: playlistDetails.name,
          spotifyPlaylistTracks: playlistDetails.tracksCount,
          status: 'pending',
          progress: 0,
          logs: [{
            message: `Transfer initialized for playlist: ${playlistDetails.name}`,
            level: 'info'
          }]
        });
        
        transfers.push(transfer);
      }
      
      return transfers;
    } catch (error) {
      console.error('Error initializing transfers:', error);
      throw error;
    }
  }
  
  // Process transfers asynchronously
  async processTransfers(transfers) {
    try {
      for (const transfer of transfers) {
        // Process each transfer in sequence
        this.processTransfer(transfer._id).catch(error => {
          console.error(`Error processing transfer ${transfer._id}:`, error);
        });
      }
    } catch (error) {
      console.error('Error processing transfers:', error);
    }
  }
  
  // Process a single transfer
  async processTransfer(transferId) {
    try {
      // Get transfer record
      const transfer = await Transfer.findById(transferId);
      
      if (!transfer || transfer.status === 'completed' || transfer.status === 'failed') {
        return;
      }
      
      // Update status to processing
      transfer.status = 'processing';
      transfer.startTime = new Date();
      transfer.logs.push({
        message: `Starting transfer process for playlist: ${transfer.spotifyPlaylistName}`,
        level: 'info'
      });
      await transfer.save();
      
      // Get tracks from Spotify
      const tracks = await SpotifyService.getPlaylistTracks(
        this.userId, 
        transfer.spotifyPlaylistId
      );
      
      // Create playlist on YouTube Music
      const youtubePlaylist = await YouTubeService.createPlaylist(
        this.userId,
        transfer.spotifyPlaylistName,
        `Transferred from Spotify playlist: ${transfer.spotifyPlaylistName}`
      );
      
      // Update transfer with YouTube playlist info
      transfer.youtubePlaylistId = youtubePlaylist.id;
      transfer.youtubePlaylistName = youtubePlaylist.name;
      transfer.logs.push({
        message: `Created YouTube Music playlist: ${youtubePlaylist.name}`,
        level: 'info'
      });
      await transfer.save();
      
      // Process each track
      let matchedTracks = 0;
      
      for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i];
        
        try {
          // Search for track on YouTube
          const searchQuery = `${track.name} ${track.artists.join(' ')}`;
          const searchResults = await YouTubeService.searchTrack(this.userId, searchQuery);
          
          if (searchResults && searchResults.length > 0) {
            // Add best match to playlist
            await YouTubeService.addTrackToPlaylist(
              this.userId,
              youtubePlaylist.id,
              searchResults[0].id
            );
            
            matchedTracks++;
            
            // Log every 5 tracks or for the last one
            if (i % 5 === 0 || i === tracks.length - 1) {
              transfer.logs.push({
                message: `Transferred ${i + 1}/${tracks.length} tracks`,
                level: 'info'
              });
            }
          } else {
            transfer.logs.push({
              message: `Could not find a match for: ${track.name} by ${track.artists.join(', ')}`,
              level: 'warning'
            });
          }
          
          // Update progress
          transfer.progress = Math.round(((i + 1) / tracks.length) * 100);
          transfer.tracksMatched = matchedTracks;
          transfer.tracksNotFound = i + 1 - matchedTracks;
          await transfer.save();
          
          // Add small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Error processing track ${track.name}:`, error);
          transfer.logs.push({
            message: `Error processing track: ${track.name}. ${error.message}`,
            level: 'error'
          });
          await transfer.save();
        }
      }
      
      // Mark transfer as completed
      transfer.status = 'completed';
      transfer.progress = 100;
      transfer.endTime = new Date();
      transfer.logs.push({
        message: `Transfer completed. ${matchedTracks}/${tracks.length} tracks transferred successfully.`,
        level: 'info'
      });
      await transfer.save();
      
      // Update transfer history
      await TransferHistory.findOneAndUpdate(
        { user: this.userId },
        { 
          $inc: { 
            successfulTransfers: 1,
            totalTracksTransferred: matchedTracks
          } 
        }
      );
    } catch (error) {
      console.error('Error in processTransfer:', error);
      
      // Update transfer as failed
      await Transfer.findByIdAndUpdate(transferId, {
        status: 'failed',
        endTime: new Date(),
        error: error.message,
        $push: {
          logs: {
            message: `Transfer failed: ${error.message}`,
            level: 'error'
          }
        }
      });
      
      // Update transfer history
      await TransferHistory.findOneAndUpdate(
        { user: this.userId },
        { $inc: { failedTransfers: 1 } }
      );
    }
  }
}

module.exports = TransferService;
