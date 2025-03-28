import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const [isHoveringSpotify, setIsHoveringSpotify] = useState(false);
  const [isHoveringYT, setIsHoveringYT] = useState(false);
  const [animateArrow, setAnimateArrow] = useState(false);

  useEffect(() => {
    // Start the arrow animation after the component mounts
    const timer = setTimeout(() => setAnimateArrow(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const startTransfer = () => {
    navigate('/spotify');
  };

  const handleSpotifyHover = (isHovering) => {
    setIsHoveringSpotify(isHovering);
  };

  const handleYTHover = (isHovering) => {
    setIsHoveringYT(isHovering);
  };

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1 className="title">Seamless Playlist Transfer</h1>
        <p className="subtitle">Move your favorite music between platforms in just a few clicks</p>
      </div>

      <div className="platforms-container">
        <div 
          className={`platform ${isHoveringSpotify ? 'active' : ''}`}
          onMouseEnter={() => handleSpotifyHover(true)}
          onMouseLeave={() => handleSpotifyHover(false)}
        >
          <img src="src/assets/spotify-logo.png" alt="Spotify Logo" className="logo spotify-logo" />
          <p className="platform-name">Spotify</p>
        </div>
        
        <div className="arrows-container">
          <div className={`arrow forward-arrow ${animateArrow ? 'animate' : ''}`}>→</div>
          <div className={`arrow backward-arrow ${animateArrow ? 'animate-delay' : ''}`}>←</div>
        </div>
        
        <div 
          className={`platform ${isHoveringYT ? 'active' : ''}`}
          onMouseEnter={() => handleYTHover(true)}
          onMouseLeave={() => handleYTHover(false)}
        >
          <img src="src/assets/ytmusic-logo.png" alt="YouTube Music Logo" className="logo ytmusic-logo" />
          <p className="platform-name">YouTube Music</p>
        </div>
      </div>

      <button className="start-button pulse" onClick={startTransfer}>
        Start Transfer Now
      </button>
    </div>
  );
}

export default Home;
