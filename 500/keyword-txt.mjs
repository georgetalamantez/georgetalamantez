import { promises as fs } from 'fs';
import path from 'path';

const sourceDir = 'c:/users/owner/downloads/listing/pages'; // Source directory
const destDir = 'c:/users/owner/downloads/listing/500html'; // Destination directory
const fileCount = 250;
const keywords = ['package', 'import .org', 'listing']; // Keywords to look for

// Function to check for keywords
async function checkFileCriteria(file) {
  const content = await fs.readFile(path.join(sourceDir, file), 'utf-8');

  // Check if any keyword is present
  const containsKeyword = keywords.some(keyword => content.toLowerCase().includes(keyword));

  // Return valid only if keywords are found
  return { valid: containsKeyword };
}

// Main function to move files based on keyword criteria
async function moveFiles() {
  try {
    let files = await fs.readdir(sourceDir);
    files = files.filter(file => file.endsWith('.txt'));

    let validFiles = [];

    // Check each file based on keywords
    for (const file of files) {
      const { valid } = await checkFileCriteria(file);
      if (valid) {
        validFiles.push(file); // Add valid files to the list
      }
    }

    if (validFiles.length === 0) {
      console.log('No valid files found based on the given criteria.');
      return;
    }

    let movedCount = 0;
    const selectedFiles = validFiles.slice(0, fileCount); // Select up to fileCount files

    for (const file of selectedFiles) {
      const sourcePath = path.join(sourceDir, file);
      const destPath = path.join(destDir, file);
      await fs.rename(sourcePath, destPath);
      movedCount++;
      console.log(`Moved ${file} to ${destDir}`);
    }

    console.log(`Successfully moved ${movedCount} HTML files.`);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Start the process
moveFiles();
