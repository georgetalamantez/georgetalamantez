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
  } catch (err) {
    console.error(`Error moving file ${sourcePath}:`, err);
  }
}

// Function to move up to 250 files based on the index
async function moveFilesBasedOnIndex(indexFilePath, sourceDir, destinationDir) {
  try {
    const index = await loadIndex(indexFilePath);
    const filesToMove = Object.keys(index)
      .filter(file => index[file].containsKeywords)
      .slice(0, 250); // Limit to 250 files

    if (filesToMove.length === 0) {
      console.log('No files to move.');
      return;
    }

    for (const file of filesToMove) {
      const sourcePath = path.join(sourceDir, file);
      const destinationPath = path.join(destinationDir, file);
      await moveFile(sourcePath, destinationPath);
    }

    console.log(`${filesToMove.length} files moved.`);
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
