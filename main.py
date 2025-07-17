import json
from collections import Counter, defaultdict
import re

# Load the data
with open('top_10000_all_time.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Helper to extract year from releaseDate
# Grabs the last 4-digit number in the string

def extract_year(release_date):
    if not release_date:
        return None
    years = re.findall(r'(19|20)\d{2}', release_date)
    return years[-1] if years else None

# Count years and genres
year_counter = Counter()
genre_counter = Counter()
genre_by_year = defaultdict(Counter)

for item in data:
    year = extract_year(item.get('releaseDate', ''))
    genres = item.get('genre', '')
    # Some entries may have multiple genres separated by commas
    genre_list = [g.strip() for g in genres.split(',') if g.strip()]
    if year:
        year_counter[year] += 1
        for genre in genre_list:
            genre_by_year[year][genre] += 1
    for genre in genre_list:
        genre_counter[genre] += 1

print("Top 10 Release Years:")
for year, count in year_counter.most_common(10):
    print(f"{year}: {count}")

print("\nTop 10 Genres:")
for genre, count in genre_counter.most_common(10):
    print(f"{genre}: {count}")

print("\nTop 3 Genres by Year (for each year):")
for year in sorted(genre_by_year):
    top_genres = genre_by_year[year].most_common(3)
    print(f"{year}: {', '.join([f'{g} ({c})' for g, c in top_genres])}")