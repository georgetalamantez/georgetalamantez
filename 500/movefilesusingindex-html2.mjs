import { promises as fs } from 'fs';
import path from 'path';

const sourceDir = 'c:/users/owner/downloads/listing/pages'; // Source directory
const destDir = 'c:/users/owner/downloads/listing/500html'; // Destination directory
const indexFile = 'c:/users/owner/downloads/listing/index.json'; // Index file
const fileCount = 250; // Max number of files to move

async function moveFilesUsingIndex(newKeywords) {
  try {
    // Load the existing index
    const indexData = await fs.readFile(indexFile, 'utf-8');
    const index = JSON.parse(indexData);

    let matchedFiles = [];

    // Search for new keywords in the stored headings and title
    for (const [file, data] of Object.entries(index)) {
      const { headings, title } = data;

      // Check if any of the new keywords are present in the headings or title
      const containsNewKeyword = newKeywords.some(keyword => 
        headings.includes(keyword.toLowerCase()) || title.includes(keyword.toLowerCase())
      );

      if (containsNewKeyword) {
        matchedFiles.push(file);
      }
    }

    if (matchedFiles.length === 0) {
      console.log('No files matched the new keywords.');
      return;
    }

    let movedCount = 0;
    const selectedFiles = matchedFiles.slice(0, fileCount); // Select up to fileCount files

    // Move the matched files to the destination directory
    for (const file of selectedFiles) {
      const sourcePath = path.join(sourceDir, file);
      const destPath = path.join(destDir, file);
      await fs.rename(sourcePath, destPath);
      movedCount++;
      console.log(`Moved ${file} to ${destDir}`);
    }

    console.log(`Successfully moved ${movedCount} files based on the new keywords.`);
  } catch (error) {
    console.error('Error moving files:', error);
  }
}

// Example usage: Search for and move files based on new keywords
moveFilesUsingIndex(['related work', 'literature review', 'summary', 'conclusion']);
