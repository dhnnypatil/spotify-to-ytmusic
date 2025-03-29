const mongoose = require('mongoose');

const transferSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  spotifyPlaylistId: {
    type: String,
    required: true
  },
  spotifyPlaylistName: {
    type: String,
    required: true
  },
  spotifyPlaylistTracks: {
    type: Number,
    required: true
  },
  youtubePlaylistId: {
    type: String,
    default: null
  },
  youtubePlaylistName: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  logs: [{
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    level: {
      type: String,
      enum: ['info', 'warning', 'error'],
      default: 'info'
    }
  }],
  tracksMatched: {
    type: Number,
    default: 0
  },
  tracksNotFound: {
    type: Number,
    default: 0
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  },
  error: {
    type: String
  }
}, { timestamps: true });

const Transfer = mongoose.model('Transfer', transferSchema);

module.exports = Transfer;
