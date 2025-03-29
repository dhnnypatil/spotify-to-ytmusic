const express = require('express');
const router = express.Router();
const { loginUser, registerUser, refreshToken } = require('../controllers/auth.controller');
const { initiateSpotifyAuth, spotifyCallback } = require('../controllers/spotify.auth.controller');
const { initiateYouTubeAuth, youtubeCallback } = require('../controllers/youtube.auth.controller');

// User authentication
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh-token', refreshToken);

// Spotify OAuth
router.get('/spotify', initiateSpotifyAuth);
router.get('/spotify/callback', spotifyCallback);

// YouTube Music OAuth
router.get('/youtube', initiateYouTubeAuth);
router.get('/youtube/callback', youtubeCallback);

module.exports = router;
