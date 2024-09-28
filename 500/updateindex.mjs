import { promises as fs } from 'fs';
import path from 'path';
import { load } from 'cheerio'; // Use named import

const sourceDir = 'c:/users/owner/downloads/listing/pages'; // Source directory
const indexFile = 'c:/users/owner/downloads/listing/index.json'; // Index file

async function updateIndex() {
  let index = {};

  // Load the existing index if it exists
  try {
    const indexData = await fs.readFile(indexFile, 'utf-8');
    index = JSON.parse(indexData);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error('Error loading index:', err);
      return;
    }
  }

  // Read files from the source directory
  let files = await fs.readdir(sourceDir);
  files = files.filter(file => file.endsWith('.htm') || file.endsWith('.html') || file.endsWith('.xhtml'));

  let addedFilesCount = 0;
  let removedFilesCount = 0;

  // Process new files (files in the directory but not in the index)
  for (const file of files) {
    if (!index[file]) { // Check if file is NOT in the index
      const filePath = path.join(sourceDir, file);
      const content = await fs.readFile(filePath, 'utf-8');
      const $ = load(content);
      const headings = $('h1, h2, h3, h4, h5, h6').text().toLowerCase(); // Extract all headings
      const title = $('title').text().toLowerCase(); // Extract the title
      const characterCount = content.length; // Calculate character count
      const stats = await fs.stat(filePath);
      const lastModified = stats.mtimeMs; // Get last modified time

      // Add the new file entry to the index
      index[file] = {
        lastModified,
        headings,
        title,
        characterCount
      };

      console.log(`Added new file to index: ${file}`);
      addedFilesCount++;
    }
  }

  // Remove files from the index that no longer exist in the source folder
  for (const indexedFile in index) {
    if (!files.includes(indexedFile)) {
      delete index[indexedFile]; // Remove the file from the index
      console.log(`Removed missing file from index: ${indexedFile}`);
      removedFilesCount++;
    }
  }

  // Write the updated index back to the file
  await fs.writeFile(indexFile, JSON.stringify(index, null, 2));
  console.log(`Index update complete. Added ${addedFilesCount} new files. Removed ${removedFilesCount} missing files.`);
}

// Start the process
updateIndex();
