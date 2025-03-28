import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './YTMusicIntegration.css';

function YTMusicIntegration() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedPlaylists, setSelectedPlaylists] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve selected playlists
    const playlistsFromStorage = sessionStorage.getItem('selectedPlaylists');
    if (playlistsFromStorage) {
      setSelectedPlaylists(JSON.parse(playlistsFromStorage));
    } else {
      // If no playlists are selected, go back to Spotify page
      navigate('/spotify');
    }
  }, [navigate]);

  const handleAuthenticate = () => {
    // In a real app, you would redirect to YouTube Music OAuth
    // For demo purposes, we'll simulate successful authentication
    setIsAuthenticated(true);
    setIsReady(true);
  };

  const handleStartTransfer = () => {
    navigate('/transfer-progress');
  };

  return (
    <div className="ytmusic-container">
      <h2>YouTube Music Integration</h2>
      
      <div className="selected-playlists">
        <h3>Selected Playlists</h3>
        <ul className="playlist-summary">
          {selectedPlaylists.map(playlist => (
            <li key={playlist.id}>
              <img src={playlist.imageUrl} alt={playlist.name} className="playlist-thumb" />
              <span>{playlist.name} ({playlist.trackCount} tracks)</span>
            </li>
          ))}
        </ul>
      </div>

      {!isAuthenticated ? (
        <div className="auth-section">
          <p>Connect to your YouTube Music account to transfer playlists</p>
          <button onClick={handleAuthenticate} className="ytmusic-button">
            Connect to YouTube Music
          </button>
        </div>
      ) : (
        <div className="transfer-section">
          <p>Ready to transfer {selectedPlaylists.length} playlist(s) to YouTube Music</p>
          <button 
            onClick={handleStartTransfer} 
            className="transfer-button"
            disabled={!isReady}
          >
            Start Transfer
          </button>
        </div>
      )}
    </div>
  );
}

export default YTMusicIntegration;
