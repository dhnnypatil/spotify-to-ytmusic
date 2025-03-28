import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SpotifyIntegration.css';

function SpotifyIntegration() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylists, setSelectedPlaylists] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated with Spotify
    const checkAuth = () => {
      // In a real app, you would check if there's a valid token
      // For demo purposes, we'll set it to false initially
      setIsAuthenticated(false);
    };
    
    checkAuth();
  }, []);

  const handleAuthenticate = () => {
    // In a real app, you would redirect to Spotify OAuth
    // For demo purposes, we'll simulate successful authentication
    setIsAuthenticated(true);
    
    // Mock fetching playlists
    const mockPlaylists = [
      { id: 1, name: 'Favorites', trackCount: 42, imageUrl: 'https://via.placeholder.com/60' },
      { id: 2, name: 'Workout Mix', trackCount: 25, imageUrl: 'https://via.placeholder.com/60' },
      { id: 3, name: 'Chill Vibes', trackCount: 30, imageUrl: 'https://via.placeholder.com/60' },
      { id: 4, name: 'Road Trip', trackCount: 18, imageUrl: 'https://via.placeholder.com/60' }
    ];
    setPlaylists(mockPlaylists);
  };

  const togglePlaylist = (playlistId) => {
    if (selectedPlaylists.includes(playlistId)) {
      setSelectedPlaylists(selectedPlaylists.filter(id => id !== playlistId));
    } else {
      setSelectedPlaylists([...selectedPlaylists, playlistId]);
    }
  };

  const handleContinue = () => {
    if (selectedPlaylists.length > 0) {
      // Store selected playlists in sessionStorage or context
      sessionStorage.setItem('selectedPlaylists', JSON.stringify(
        playlists.filter(playlist => selectedPlaylists.includes(playlist.id))
      ));
      navigate('/ytmusic');
    }
  };

  return (
    <div className="spotify-container">
      <h2>Spotify Integration</h2>
      
      {!isAuthenticated ? (
        <div className="auth-section">
          <p>Connect to your Spotify account to access your playlists</p>
          <button onClick={handleAuthenticate} className="spotify-button">
            Connect to Spotify
          </button>
        </div>
      ) : (
        <div className="playlists-section">
          <h3>Select playlists to transfer</h3>
          <div className="playlists-list">
            {playlists.map(playlist => (
              <div 
                key={playlist.id} 
                className={`playlist-item ${selectedPlaylists.includes(playlist.id) ? 'selected' : ''}`}
                onClick={() => togglePlaylist(playlist.id)}
              >
                <img src={playlist.imageUrl} alt={playlist.name} className="playlist-image" />
                <div className="playlist-info">
                  <h4>{playlist.name}</h4>
                  <p>{playlist.trackCount} tracks</p>
                </div>
                <div className="playlist-checkbox">
                  {selectedPlaylists.includes(playlist.id) ? '✓' : ''}
                </div>
              </div>
            ))}
          </div>
          <div className="actions">
            <button 
              onClick={handleContinue} 
              className="continue-button"
              disabled={selectedPlaylists.length === 0}
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SpotifyIntegration;
