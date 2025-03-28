import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TransferProgress.css';

function TransferProgress() {
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve selected playlists
    const playlists = JSON.parse(sessionStorage.getItem('selectedPlaylists') || '[]');
    
    // Simulate transfer process with timeouts
    let currentProgress = 0;
    
    // Add initial log
    addLogMessage('Starting transfer process...');
    
    // Process each playlist
    playlists.forEach((playlist, index) => {
      const startDelay = index * 1500;
      
      setTimeout(() => {
        addLogMessage(`Starting transfer of "${playlist.name}"...`);
      }, startDelay);
      
      // Process tracks in each playlist
      const trackDelayBase = startDelay + 500;
      const increment = 100 / (playlists.length * playlist.trackCount);
      
      for (let i = 0; i < playlist.trackCount; i++) {
        setTimeout(() => {
          currentProgress += increment;
          setProgress(Math.min(Math.round(currentProgress), 95));
          
          if (i % 5 === 0 || i === playlist.trackCount - 1) {
            addLogMessage(`Transferred ${i + 1}/${playlist.trackCount} tracks from "${playlist.name}"`);
          }
          
          // If this is the last track of the last playlist
          if (index === playlists.length - 1 && i === playlist.trackCount - 1) {
            setTimeout(() => {
              setProgress(100);
              addLogMessage('Transfer complete!');
              setIsComplete(true);
            }, 1000);
          }
        }, trackDelayBase + (i * 300));
      }
    });
    
    // If no playlists were selected, redirect back
    if (playlists.length === 0) {
      navigate('/spotify');
    }
  }, [navigate]);
  
  const addLogMessage = (message) => {
    setLogs(prevLogs => [
      ...prevLogs, 
      { id: Date.now(), time: new Date().toLocaleTimeString(), message }
    ]);
  };
  
  const handleDone = () => {
    // Clear storage and go home
    sessionStorage.removeItem('selectedPlaylists');
    navigate('/');
  };

  return (
    <div className="transfer-progress-container">
      <h2>Transfer Progress</h2>
      
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        <div className="progress-text">{progress}%</div>
      </div>
      
      <div className="logs-container">
        <h3>Transfer Logs</h3>
        <div className="logs">
          {logs.map(log => (
            <div key={log.id} className="log-entry">
              <span className="log-time">[{log.time}]</span>
              <span className="log-message">{log.message}</span>
            </div>
          ))}
        </div>
      </div>
      
      {isComplete && (
        <div className="complete-section">
          <p>All playlists have been successfully transferred to YouTube Music!</p>
          <button onClick={handleDone} className="done-button">
            Done
          </button>
        </div>
      )}
    </div>
  );
}

export default TransferProgress;
