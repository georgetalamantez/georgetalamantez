import { promises as fs } from 'fs';
import path from 'path';
import { load } from 'cheerio';

const sourceDir = 'c:/users/owner/downloads/listing/pages'; // Source directory
const destDir = 'c:/users/owner/downloads/listing/500html'; // Destination directory
const indexFile = './index-html.json'; // Index file
const fileCount = 500; // Max number of files to move
const minCharCount = 5000; // Minimum character count
const maxCharCount = 30000; // Maximum character count

// Function to update the index
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

  return index; // Return the updated index for further processing
}

// Function to move files based on keywords, character count, and index data
async function moveFilesUsingIndex(newKeywords, index) {
  let matchedFiles = [];

  // Search for files that meet character count, keywords in headings/title, and optional keywordMatches
  for (const [file, data] of Object.entries(index)) {
    const { headings, title, characterCount, keywordMatches } = data;

    // Check if the file meets the character count range
    if (characterCount < minCharCount || characterCount > maxCharCount) {
      continue; // Skip files outside the character count range
    }

    // Check if any of the new keywords are present in the headings, title, or keywordMatches
    const containsNewKeyword = newKeywords.some(keyword =>
      headings.toLowerCase().includes(keyword.toLowerCase()) ||
      title.toLowerCase().includes(keyword.toLowerCase()) ||
      (keywordMatches && keywordMatches[keyword.toLowerCase()])
    );

    if (containsNewKeyword) {
      matchedFiles.push(file);
    }
  }

  if (matchedFiles.length === 0) {
    console.log('No files matched the new keywords and character count.');
    return;
  }

  let movedCount = 0;
  let fileIndex = 0;

  // Move files until the desired number of files have been moved
  while (movedCount < fileCount && fileIndex < matchedFiles.length) {
    const file = matchedFiles[fileIndex];
    const sourcePath = path.join(sourceDir, file);

    // Check if the file still exists in the source directory
    try {
      await fs.access(sourcePath); // Check file existence
    } catch {
      console.log(`File ${file} no longer exists in the source directory, skipping.`);
      fileIndex++;
      continue; // Skip to the next file if it doesn't exist
    }

    const destPath = path.join(destDir, file);
    await fs.rename(sourcePath, destPath);
    movedCount++;
    console.log(`Moved ${file} to ${destDir}`);

    fileIndex++;
  }

  console.log(`Successfully moved ${movedCount} files based on the new keywords and character count.`);
}

// Start the process: Update the index first, then move files based on the updated index
async function start() {
  const index = await updateIndex(); // Update the index first
  const keywords = ['related work', 'literature review', 'summary', 'conclusion']; // Example keywords
  await moveFilesUsingIndex(keywords, index); // Move files based on the updated index
}

start();
