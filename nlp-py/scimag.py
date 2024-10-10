import requests
from bs4 import BeautifulSoup
import os

# The URL of the page containing torrent files
url = 'https://libgen.is/scimag/repository_torrent/'

# Create a folder to save the downloaded torrents
if not os.path.exists('torrents'):
    os.makedirs('torrents')

# Request the page
response = requests.get(url)
soup = BeautifulSoup(response.content, 'html.parser')

# Find all links ending with .torrent
torrent_links = [link.get('href') for link in soup.find_all('a') if link.get('href').endswith('.torrent')]

# Download each .torrent file
for torrent_link in torrent_links:
    torrent_url = url + torrent_link
    file_name = os.path.join('torrents', torrent_link.split('/')[-1])
    print(f'Downloading {file_name}')
    
    # Download the torrent file
    with requests.get(torrent_url, stream=True) as r:
        r.raise_for_status()
        with open(file_name, 'wb') as f:
            for chunk in r.iter_content(chunk_size=8192):
                f.write(chunk)

print("Download complete.")
