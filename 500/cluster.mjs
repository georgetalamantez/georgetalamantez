import fs from 'fs';
import pkg from 'stream-json'; // Import the whole package
const { parser } = pkg; // Extract the parser from the imported package
import streamValuesPkg from 'stream-json/streamers/StreamValues.js'; // Import StreamValues as a whole package
const { streamValues } = streamValuesPkg; // Extract streamValues from the package
import natural from 'natural';
import KMeans from 'ml-kmeans'; // Adjust the import for KMeans

const tokenizer = new natural.WordTokenizer();
const wordFrequencies = [];

// Stream the JSON file
const pipeline = fs.createReadStream('c:/users/owner/downloads/listing/index.json')
  .pipe(parser())
  .pipe(streamValues());

pipeline.on('data', (data) => {
  const fileData = data.value;

  // Process the fileData object (which is your file metadata)
  const titleTokens = tokenizer.tokenize(fileData.title || '');
  const headingTokens = tokenizer.tokenize(fileData.headings || '');

  const tokens = [...titleTokens, ...headingTokens];
  const freqMap = {};

  tokens.forEach(token => {
    token = token.toLowerCase();
    freqMap[token] = (freqMap[token] || 0) + 1;
  });

  wordFrequencies.push(freqMap);
});

pipeline.on('end', () => {
  console.log('Finished processing the JSON file.');

  // Convert word frequency maps to vectors for clustering
  const wordFrequenciesToVectors = (wordFrequencies) => {
    const uniqueWords = new Set();
    
    wordFrequencies.forEach(freqMap => {
      Object.keys(freqMap).forEach(word => uniqueWords.add(word));
    });

    const wordsArray = Array.from(uniqueWords);
    const vectors = wordFrequencies.map(freqMap => {
      return wordsArray.map(word => freqMap[word] || 0);
    });

    return { vectors, wordsArray };
  };

  const performClustering = (vectors, numClusters) => {
    const kmeans = new KMeans(); // Instantiate the KMeans class
    return kmeans.cluster(vectors, numClusters); // Call the cluster method
  };

  const { vectors } = wordFrequenciesToVectors(wordFrequencies);

  // Set the number of clusters
  const numClusters = 3;
  const clusters = performClustering(vectors, numClusters);

  console.log('Clustering Result:');
  console.log(clusters);
});

pipeline.on('error', (err) => {
  console.error('Error while processing JSON file:', err);
});
