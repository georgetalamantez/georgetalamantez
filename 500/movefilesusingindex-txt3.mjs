import { promises as fs } from 'fs';
import path from 'path';

const sourceDir = 'c:/users/owner/downloads/listing/pages'; // Source directory
const destDir = 'c:/users/owner/downloads/listing/500html'; // Destination directory
const indexFile = './index-txt.json'; // Index file
const fileCount = 250; // Max number of files to move
const minCharCount = 1000; // Minimum character count
const maxCharCount = 30000; // Maximum character count

async function moveFilesUsingIndex(newKeywords) {
  try {
    // Load the existing index
    const indexData = await fs.readFile(indexFile, 'utf-8');
    const index = JSON.parse(indexData);

    let matchedFiles = [];

    // Search for new keywords in the title and keywords
    for (const [file, data] of Object.entries(index)) {
      const { title, characterCount, keyword1, keyword2, keyword3 } = data;

      // Check if file meets the character count range
      if (characterCount < minCharCount || characterCount > maxCharCount) {
        continue; // Skip files outside the character count range
      }

      // Check if any of the new keywords are present in the title or keywords
      const containsNewKeyword = newKeywords.some(keyword => {
        const titleLower = title ? title.toLowerCase() : '';
        const keyword1Lower = keyword1 ? keyword1.toLowerCase() : '';
        const keyword2Lower = keyword2 ? keyword2.toLowerCase() : '';
        const keyword3Lower = keyword3 ? keyword3.toLowerCase() : '';

        return titleLower.includes(keyword.toLowerCase()) ||
               keyword1Lower === keyword.toLowerCase() ||
               keyword2Lower === keyword.toLowerCase() ||
               keyword3Lower === keyword.toLowerCase();
      });

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

    // Move files until 250 files are successfully moved
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

// Example usage: Search for and move files based on new keywords and character count range
moveFilesUsingIndex(['java', 'javascript', 'python']);
