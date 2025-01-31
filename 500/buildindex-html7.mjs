import { promises as fs } from 'fs';
import path from 'path';
import { load } from 'cheerio';

const sourceDir = 'c:/users/owner/downloads/listing/pages'; // Source directory
const indexFile = './index-html.json'; // Index file
const keywords = ['algorithm', 'algebra', 'cluster', 'deep learning', 'database', 'graph', 'machine learning', 'matrix', 'neural network', 'network', 'artificial intelligence', 'yaml']; // Define the keywords to search for

async function buildIndex() {
  let index = {};
  let previousKeywords = []; // To store previous keywords

  // Check if index file exists, and load it if present
  try {
    const indexData = await fs.readFile(indexFile, 'utf-8');
    index = JSON.parse(indexData);  // Load existing index
    previousKeywords = index._keywords || []; // Load previous keywords if present
  } catch (err) {
    if (err.code !== 'ENOENT') {  // File not found error is ok, others are not
      console.error('Error loading index:', err);
      return;
    }
  }

  // Check if keywords have changed
  const keywordsChanged = previousKeywords.length !== keywords.length || 
    previousKeywords.some((kw, i) => kw !== keywords[i]);

  let files = await fs.readdir(sourceDir);
  files = files.filter(file => file.endsWith('.htm') || file.endsWith('.html') || file.endsWith('.xhtml'));

  let updatedFilesCount = 0;
  let skippedFilesCount = 0;
  let removedFilesCount = 0;

  // Process existing files
  for (const file of files) {
    const filePath = path.join(sourceDir, file);
    const stats = await fs.stat(filePath);
    const lastModified = stats.mtimeMs; // Get file's last modified time

    // Check if the file is already in the index, hasn't been modified, and keywords haven't changed
    if (index[file] && index[file].lastModified >= lastModified && !keywordsChanged) {
      console.log(`Skipping unchanged file: ${file}`); // Log for skipped files
      skippedFilesCount++;
      continue; // Skip processing this file if it hasn't been modified and keywords haven't changed
    }

    // Read and parse the file content
    const content = await fs.readFile(filePath, 'utf-8');
    const $ = load(content);
    const headings = $('h1, h2, h3, h4, h5, h6').text().toLowerCase(); // Extract all headings
    const title = $('title').text().toLowerCase(); // Extract the title
    const characterCount = content.length; // Calculate character count

    // Check if any of the keywords are present in the content
    const keywordMatches = {};
    for (const keyword of keywords) {
      keywordMatches[keyword] = content.toLowerCase().includes(keyword.toLowerCase());
    }

    // Update or add the file entry in the index, storing the headings, title, character count, and keyword matches
    index[file] = {
      lastModified,       // Store the last modified time
      headings,           // Store the extracted headings
      title,              // Store the title
      characterCount,     // Store the character count
      keywordMatches      // Store keyword match results
    };

    console.log(`Updated index for file: ${file}`); // Log for updated files
    updatedFilesCount++;
  }

  // Remove entries for files that no longer exist in the folder
  for (const indexedFile in index) {
    if (!files.includes(indexedFile)) {
      delete index[indexedFile];
      removedFilesCount++;
    }
  }

  // Add current keywords to the index metadata
  index._keywords = keywords;

  // Write the updated index back to the file
  await fs.writeFile(indexFile, JSON.stringify(index, null, 2));
  console.log(`Index updated. Processed ${updatedFilesCount} files. Skipped ${skippedFilesCount} unchanged files. Removed ${removedFilesCount} files that no longer exist.`);
}

// Start the process
buildIndex();
