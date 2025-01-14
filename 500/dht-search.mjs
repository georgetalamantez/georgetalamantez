import DHT from 'bittorrent-dht';

// Create a new DHT instance
const dht = new DHT();

// Port to listen on
const PORT = 20000;

// Start listening for DHT nodes
dht.listen(PORT, () => {
  console.log(`DHT is now listening on port ${PORT}`);
});

// Keyword to search for
const keyword = 'Sacramento Kings at Memphis Grizzlies 05.12.2024.mkv';

// Helper function to create a fake infohash from the keyword
const createFakeInfoHash = (key) => {
  // Simple hashing function (placeholder for actual implementation)
  const hash = Buffer.from(key).toString('hex').slice(0, 20);
  return Buffer.from(hash, 'hex');
};

// Create a fake infohash from the keyword
const fakeInfoHash = createFakeInfoHash(keyword);

// Join the DHT network and search for the keyword
dht.on('ready', () => {
  console.log(`Searching DHT for: ${keyword}`);
  
  // Announce the fake infohash
  dht.announce(fakeInfoHash, 6881, (err) => {
    if (err) {
      console.error('Error during announce:', err);
      return;
    }
    console.log('Announced fake infohash:', fakeInfoHash.toString('hex'));
  });

  // Lookup peers for the fake infohash
  dht.lookup(fakeInfoHash, (err, peer) => {
    if (err) {
      console.error('Error during lookup:', err);
      return;
    }
    console.log('Found peer:', peer);
  });

  // End the search after 30 seconds
  setTimeout(() => {
    console.log('Search complete. Destroying DHT instance...');
    dht.destroy();
  }, 30000);
});
