# spotify-to-ytmusic

Transfer playlists from Spotify to YouTube Music.

## Frontend

This project uses React with Vite for the frontend. To get started:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

4. Preview the production build:
   ```bash
   npm run preview
   ```

## Features

- Home page with Spotify and YouTube Music logos
- Spotify authentication and playlist selection
- YouTube Music authentication
- Visual transfer progress with real-time logs
- Responsive design

## Project Structure

- `src/components/Home.jsx` - Landing page
- `src/components/SpotifyIntegration.jsx` - Spotify authentication and playlist selection
- `src/components/YTMusicIntegration.jsx` - YouTube Music authentication
- `src/components/TransferProgress.jsx` - Visual transfer process with logs

## Implementation Details

The application flow is as follows:
1. User selects to transfer from Spotify to YouTube Music on the home page
2. User authenticates with Spotify and selects playlists to transfer
3. User authenticates with YouTube Music
4. Transfer begins and user can view progress in real-time
5. User is notified when transfer is complete

## Note

This is a frontend demo. For a complete solution, you would need to implement backend services for:
1. Spotify OAuth authentication
2. YouTube Music OAuth authentication
3. Playlist transfer service
