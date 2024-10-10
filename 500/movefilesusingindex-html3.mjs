// searches for keywords in titles and headings skipping missing files
import { promises as fs } from 'fs';
import path from 'path';

const sourceDir = 'c:/users/owner/downloads/listing/pages'; // Source directory
const destDir = 'c:/users/owner/downloads/listing/500html'; // Destination directory
const indexFile = 'index-html.json'; // Index file
const fileCount = 250; // Max number of files to move
const minCharCount = 2000; // Minimum character count
const maxCharCount = 30000; // Maximum character count

async function moveFilesUsingIndex(newKeywords) {
  try {
    // Load the existing index
    const indexData = await fs.readFile(indexFile, 'utf-8');
    const index = JSON.parse(indexData);

    let matchedFiles = [];

    // Search for new keywords in the stored headings, title, and check character count
    for (const [file, data] of Object.entries(index)) {
      const { headings, title, characterCount } = data;

      // Check if file meets the character count range
      if (characterCount < minCharCount || characterCount > maxCharCount) {
        continue; // Skip files outside the character count range
      }

      // Check if any of the new keywords are present in the headings or title
      const containsNewKeyword = newKeywords.some(keyword =>
        headings.toLowerCase().includes(keyword.toLowerCase()) || title.toLowerCase().includes(keyword.toLowerCase())
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
    const selectedFiles = matchedFiles.slice(0, fileCount); // Select up to fileCount files

    // Move the matched files to the destination directory
    for (const file of selectedFiles) {
      const sourcePath = path.join(sourceDir, file);
      const destPath = path.join(destDir, file);

      // Check if file exists in the source directory
      try {
        await fs.access(sourcePath);
      } catch (error) {
        console.log(`File not found: ${file}`);
        continue; // Skip to the next file
      }

      await fs.rename(sourcePath, destPath);
      movedCount++;
      console.log(`Moved ${file}`);

      // Stop once the desired number of files have been moved
      if (movedCount >= fileCount) {
        break;
      }
    }

    console.log(`Successfully moved ${movedCount} files.`);
  } catch (error) {
    console.error('Error moving files:', error);
  }
}

// Example usage: Search for and move files based on new keywords and character count range
moveFilesUsingIndex(['related work', 'literature review', 'summary', 'conclusion']);
