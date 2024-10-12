import { promises as fs } from 'fs';
import path from 'path';

const sourceDir = 'c:/users/owner/downloads/listing/pages'; // Source directory
const destDir = 'c:/users/owner/downloads/listing/500html'; // Destination directory
const fileCount = 250; // Number of files to move
const indexFile = './index-html.json'; // Path to the index file

// Function to move files based on the pre-built index
async function moveFilesUsingIndex() {
  try {
    // Read the index file (assumes the index is a JSON file)
    const index = JSON.parse(await fs.readFile(indexFile, 'utf-8'));
    let movedCount = 0;

    // Iterate over the entries in the index
    for (const [file, data] of Object.entries(index)) {
      // Only move files that contain the keyword based on the pre-built index
      if (data.containsKeyword) {
        const sourcePath = path.join(sourceDir, file);
        const destPath = path.join(destDir, file);
        
        // Move the file by renaming it (cut and paste)
        await fs.rename(sourcePath, destPath);
        movedCount++;
        console.log(`Moved ${file} to ${destDir}`);
      }

      // Stop once we've moved the desired number of files
      if (movedCount >= fileCount) {
        break;
      }
    }

    console.log(`Successfully moved ${movedCount} HTML files.`);
  } catch (error) {
    console.error('Error moving files:', error);
  }
}

// Call the function to move files based on the index
moveFilesUsingIndex();
