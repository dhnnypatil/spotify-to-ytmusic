const mongoose = require('mongoose');

const transferHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  transfers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transfer'
  }],
  totalTransfers: {
    type: Number,
    default: 0
  },
  successfulTransfers: {
    type: Number,
    default: 0
  },
  failedTransfers: {
    type: Number,
    default: 0
  },
  totalTracksTransferred: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

const TransferHistory = mongoose.model('TransferHistory', transferHistorySchema);

module.exports = TransferHistory;
