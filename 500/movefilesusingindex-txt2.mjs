import fs from 'fs/promises';
import path from 'path';

// Function to load the index file
async function loadIndex(indexFilePath) {
  try {
    const indexData = await fs.readFile(indexFilePath, 'utf-8');
    return JSON.parse(indexData);
  } catch (err) {
    console.error(`Error loading index file: ${indexFilePath}`, err);
    return {};
  }
}

// Function to move a file from source to destination
async function moveFile(sourcePath, destinationPath) {
  try {
    await fs.mkdir(path.dirname(destinationPath), { recursive: true });
    await fs.rename(sourcePath, destinationPath);
    console.log(`Moved: ${sourcePath} -> ${destinationPath}`);
    return true; // Return true if the file is moved successfully
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.warn(`File not found: ${sourcePath}`);
    } else {
      console.error(`Error moving file ${sourcePath}:`, err);
    }
    return false; // Return false if the file couldn't be moved
  }
}

// Function to move up to 250 files based on the index
async function moveFilesBasedOnIndex(indexFilePath, sourceDir, destinationDir) {
  try {
    const index = await loadIndex(indexFilePath);
    const filesToMove = Object.keys(index).filter(file => index[file].containsKeywords);

    let movedCount = 0;
    for (const file of filesToMove) {
      if (movedCount >= 250) break; // Stop if 250 files are successfully moved

      const sourcePath = path.join(sourceDir, file);
      const destinationPath = path.join(destinationDir, file);
      const moved = await moveFile(sourcePath, destinationPath);

      if (moved) {
        movedCount++; // Increment movedCount only if the file was successfully moved
      }
    }

    console.log(`Total files moved: ${movedCount}`);
  } catch (err) {
    console.error('Error moving files based on index:', err);
  }
}

// Specify the paths
const indexFilePath = './index-txt.json'; // Path to the index JSON file
const sourceDir = 'c:/users/owner/downloads/listing/pages'; // Path to the source directory
const destinationDir = 'c:/users/owner/downloads/listing/500html'; // Path to the destination directory

// Run the move operation
moveFilesBasedOnIndex(indexFilePath, sourceDir, destinationDir);
