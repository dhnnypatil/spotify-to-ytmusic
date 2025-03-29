const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

// Authenticate user middleware
exports.authenticateUser = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization denied, token missing' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Add user to request
    req.user = { id: user._id };
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Check Spotify connection middleware
exports.checkSpotifyAuth = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user.spotify.connected) {
      return res.status(403).json({ message: 'Spotify account not connected' });
    }
    
    next();
  } catch (error) {
    console.error('Spotify auth check error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Check YouTube connection middleware
exports.checkYouTubeAuth = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user.youtube.connected) {
      return res.status(403).json({ message: 'YouTube Music account not connected' });
    }
    
    next();
  } catch (error) {
    console.error('YouTube auth check error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Check both connections middleware
exports.checkBothAuth = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user.spotify.connected) {
      return res.status(403).json({ message: 'Spotify account not connected' });
    }
    
    if (!user.youtube.connected) {
      return res.status(403).json({ message: 'YouTube Music account not connected' });
    }
    
    next();
  } catch (error) {
    console.error('Both auth check error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
