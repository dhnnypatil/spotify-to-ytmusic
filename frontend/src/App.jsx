import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home';
import SpotifyIntegration from './components/SpotifyIntegration';
import YTMusicIntegration from './components/YTMusicIntegration';
import TransferProgress from './components/TransferProgress';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <header className="app-header">
          <h1>Playlist Transfer</h1>
        </header>
        <main className="app-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/spotify" element={<SpotifyIntegration />} />
            <Route path="/ytmusic" element={<YTMusicIntegration />} />
            <Route path="/transfer-progress" element={<TransferProgress />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <footer className="app-footer">
          <p>© 2023 Playlist Transfer</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;