# RYM Metadata Scraper & Spotify Playlist Creator

This project allows you to scrape song metadata from RateYourMusic (RYM) charts and automatically create Spotify playlists from those charts.

## Features
- **Tampermonkey Script**: Scrapes song metadata from RYM charts and outputs it as a JSON object.
- **Python Script**: Reads a chart JSON file and creates a Spotify playlist with the songs.

## Setup

### 1. Tampermonkey Script
- Install the Tampermonkey browser extension.
- Add `script.js` as a new user script.
- Visit a RYM chart page (e.g., https://rateyourmusic.com/charts/).
- Open the browser console to copy the JSON output after scraping.
- Save the JSON output in the `song charts/` or `album charts/` folder as a `.json` file.

### 2. Python Script
- Install Python 3.7+.
- Install dependencies:
  ```sh
  pip install spotipy
  ```
- Set your Spotify API credentials as environment variables:
  - `SPOTIFY_CLIENT_ID`
  - `SPOTIFY_CLIENT_SECRET`
  - (Optional) `SPOTIPY_REDIRECT_URI` (default: `http://127.0.0.1:5000/callback`)
- Run the script:
  ```sh
  python create_spotify_playlist.py
  ```
- Select a chart file when prompted. The script will create a new playlist in your Spotify account with the chart's songs.

## Security
- `.cache` (Spotify tokens) and all chart folders are gitignored and will not be pushed to GitHub.
- **Never** commit your credentials or `.cache` file.

## Folder Structure
- `script.js` — Tampermonkey script for scraping RYM.
- `create_spotify_playlist.py` — Python script for creating Spotify playlists.
- `song charts/`, `album charts/`, `misc charts/` — Store your chart JSON files here.

## Troubleshooting
- If songs are not found on Spotify, check the console output for details.
- If `.cache` was ever committed, remove it from your repo history.

## License
MIT
