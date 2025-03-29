const Transfer = require('../models/Transfer.model');
const TransferHistory = require('../models/TransferHistory.model');
const TransferService = require('../services/transfer.service');

// Start a new transfer
exports.startTransfer = async (req, res) => {
  try {
    const userId = req.user.id;
    const { playlistIds } = req.body;
    
    if (!playlistIds || !Array.isArray(playlistIds) || playlistIds.length === 0) {
      return res.status(400).json({ message: 'Please select at least one playlist to transfer' });
    }
    
    // Initialize transfer service
    const transferService = new TransferService(userId);
    
    // Create transfer records and start the transfer process
    const transfers = await transferService.initializeTransfers(playlistIds);
    
    // Add transfers to transfer history
    await TransferHistory.findOneAndUpdate(
      { user: userId },
      { $push: { transfers: { $each: transfers.map(t => t._id) } }, $inc: { totalTransfers: transfers.length } },
      { new: true }
    );
    
    // Start async processing
    transferService.processTransfers(transfers);
    
    res.status(201).json({
      message: 'Transfer process initiated successfully',
      transfers: transfers.map(t => ({
        id: t._id,
        spotifyPlaylistName: t.spotifyPlaylistName,
        status: t.status,
        progress: t.progress
      }))
    });
  } catch (error) {
    console.error('Transfer initiation error:', error);
    res.status(500).json({ message: 'Error starting transfer process' });
  }
};

// Get transfer status
exports.getTransferStatus = async (req, res) => {
  try {
    const transferId = req.params.id;
    const userId = req.user.id;
    
    const transfer = await Transfer.findOne({
      _id: transferId,
      user: userId
    });
    
    if (!transfer) {
      return res.status(404).json({ message: 'Transfer not found' });
    }
    
    res.json({
      id: transfer._id,
      spotifyPlaylistName: transfer.spotifyPlaylistName,
      status: transfer.status,
      progress: transfer.progress,
      tracksMatched: transfer.tracksMatched,
      tracksNotFound: transfer.tracksNotFound,
      youtubePlaylistId: transfer.youtubePlaylistId,
      youtubePlaylistName: transfer.youtubePlaylistName,
      logs: transfer.logs.map(log => ({
        message: log.message,
        timestamp: log.timestamp,
        level: log.level
      }))
    });
  } catch (error) {
    console.error('Get transfer status error:', error);
    res.status(500).json({ message: 'Error retrieving transfer status' });
  }
};

// Get all transfers for a user
exports.getUserTransfers = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const transfers = await Transfer.find({ user: userId })
      .sort({ createdAt: -1 })
      .select('spotifyPlaylistName status progress youtubePlaylistId youtubePlaylistName tracksMatched tracksNotFound createdAt updatedAt');
    
    res.json(transfers);
  } catch (error) {
    console.error('Get user transfers error:', error);
    res.status(500).json({ message: 'Error retrieving transfer history' });
  }
};
