import { promises as fs } from 'fs';
import path from 'path';

const sourceDir = 'c:/users/owner/downloads/listing/pages'; // Source directory
const destDir = 'c:/users/owner/downloads/listing/500html'; // Destination directory
const indexFile = './index-html.json'; // Index file
const fileCount = 500; // Max number of files to move
const minCharCount = 5000; // Minimum character count
const maxCharCount = 30000; // Maximum character count

// Function to move files based on keywords, character count, and index data
async function moveFilesUsingIndex(newKeywords) {
  try {
    // Load the existing index
    const indexData = await fs.readFile(indexFile, 'utf-8');
    const index = JSON.parse(indexData);

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
  } catch (error) {
    console.error('Error moving files:', error);
  }
}

// Example usage: Search for and move files based on new keywords, character count, and index data
moveFilesUsingIndex(['related work', 'literature review', 'summary', 'conclusion', 'algorithm', 'cluster', 'graph']);
