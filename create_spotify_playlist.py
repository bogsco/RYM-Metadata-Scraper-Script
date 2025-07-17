import os
import json
import spotipy
from spotipy.oauth2 import SpotifyOAuth

# Set your Spotify API credentials here or use environment variables
SPOTIPY_CLIENT_ID = os.getenv('SPOTIFY_CLIENT_ID', 'YOUR_CLIENT_ID')
SPOTIPY_CLIENT_SECRET = os.getenv('SPOTIFY_CLIENT_SECRET', 'YOUR_CLIENT_SECRET')
SPOTIPY_REDIRECT_URI = os.getenv('SPOTIPY_REDIRECT_URI', 'http://127.0.0.1:5000/callback')
    
# Path to the song chart JSON file
SONG_CHARTS_DIR = 'song charts'

# Prompt user to select a chart file
chart_files = [f for f in os.listdir(SONG_CHARTS_DIR) if f.endswith('.json')]
print('Available charts:')
for idx, fname in enumerate(chart_files):
    print(f'{idx + 1}: {fname}')
choice = int(input('Select a chart by number: ')) - 1
chart_path = os.path.join(SONG_CHARTS_DIR, chart_files[choice])

# Load chart data
with open(chart_path, 'r', encoding='utf-8') as f:
    chart_data = json.load(f)

# Get playlist title and items
playlist_title = chart_data.get('title', 'RYM Chart Playlist')
songs = chart_data.get('items', [])

# Authenticate with Spotify
scope = 'playlist-modify-public playlist-modify-private'
sp = spotipy.Spotify(auth_manager=SpotifyOAuth(
    client_id=SPOTIPY_CLIENT_ID,
    client_secret=SPOTIPY_CLIENT_SECRET,
    redirect_uri=SPOTIPY_REDIRECT_URI,
    scope=scope
))

user_id = sp.current_user()['id']

# Create a new playlist
playlist = sp.user_playlist_create(user=user_id, name=playlist_title, public=True)
playlist_id = playlist['id']

track_uris = []
for idx, item in enumerate(songs):
    query = f"{item['song']} {item['artist']}"
    try:
        result = sp.search(q=query, type='track', limit=1)
        tracks = result['tracks']['items']
        if tracks:
            track_uris.append(tracks[0]['uri'])
            print(f"[{idx+1}/{len(songs)}] Found: {item['song']} by {item['artist']}")
        else:
            print(f"[{idx+1}/{len(songs)}] Not found on Spotify: {query}")
    except Exception as e:
        print(f"[{idx+1}/{len(songs)}] Error searching for {query}: {e}")

# Add tracks to the playlist in batches of 100
for i in range(0, len(track_uris), 100):
    try:
        sp.playlist_add_items(playlist_id, track_uris[i:i+100])
        print(f"Added tracks {i+1} to {min(i+100, len(track_uris))} to playlist.")
    except Exception as e:
        print(f"Error adding tracks {i+1} to {min(i+100, len(track_uris))}: {e}")

print(f"Playlist '{playlist_title}' created with {len(track_uris)} tracks.")
