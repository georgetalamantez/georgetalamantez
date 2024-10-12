import { promises as fs } from 'fs';
import path from 'path';
import { load } from 'cheerio'; // Use named import

const sourceDir = 'c:/users/owner/downloads/listing/pages'; // Source directory
const indexFile = './index-html.json'; // Index file
const keywords = ['listing', 'literature review', 'related work', 'conclusion', 'summary']; // Keywords to look for

async function buildIndex() {
  let index = {};
  
  // Check if index file exists, and load it if present
  try {
    const indexData = await fs.readFile(indexFile, 'utf-8');
    index = JSON.parse(indexData);  // Load existing index
  } catch (err) {
    if (err.code !== 'ENOENT') {  // File not found error is ok, others are not
      console.error('Error loading index:', err);
      return;
    }
  }

  let files = await fs.readdir(sourceDir);
  files = files.filter(file => file.endsWith('.htm') || file.endsWith('.html') || file.endsWith('.xhtml'));

  let updatedFilesCount = 0;
  let skippedFilesCount = 0;

  for (const file of files) {
    const filePath = path.join(sourceDir, file);
    const stats = await fs.stat(filePath);
    const lastModified = stats.mtimeMs; // Get file's last modified time

    // Check if the file is already in the index and hasn't been modified
    if (index[file] && index[file].lastModified >= lastModified) {
      skippedFilesCount++;
      continue; // Skip processing this file if it hasn't been modified
    }

    // Read and parse the file content
    const content = await fs.readFile(filePath, 'utf-8');
    const $ = load(content);
    const headings = $('h1, h2, h3, h4, h5, h6').text().toLowerCase();
    const title = $('title').text().toLowerCase();

    // Check if the file contains any of the keywords
    const containsKeyword = keywords.some(keyword =>
      headings.includes(keyword.toLowerCase()) || title.includes(keyword.toLowerCase())
    );

    // Update or add the file entry in the index
    index[file] = {
      lastModified,       // Store the last modified time
      containsKeyword     // Store if it contains keywords
    };
    
    updatedFilesCount++;
  }

  // Write the updated index back to the file
  await fs.writeFile(indexFile, JSON.stringify(index, null, 2));
  console.log(`Index updated. Processed ${updatedFilesCount} files. Skipped ${skippedFilesCount} unchanged files.`);
}

// Start the process
buildIndex();
