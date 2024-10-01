import fs from 'fs/promises';
import path from 'path';

// Function to get the last modified time of a file
async function getFileStats(filePath) {
  try {
    const stats = await fs.stat(filePath);
    return stats.mtimeMs; // Get the modified time in milliseconds
  } catch (err) {
    console.error(`Error getting stats for file ${filePath}:`, err);
    return null;
  }
}

// Function to search multiple keywords within a .txt file
async function searchKeywordsInTxtFile(filePath, keywords) {
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    return keywords.some(keyword => fileContent.includes(keyword)); // Check if any keyword is present
  } catch (err) {
    console.error(`Error reading file ${filePath}:`, err);
    return false;
  }
}

// Function to load the existing index (if it exists)
async function loadExistingIndex(indexFilePath) {
  try {
    const indexData = await fs.readFile(indexFilePath, 'utf-8');
    return JSON.parse(indexData);
  } catch (err) {
    // Return an empty object if the index file doesn't exist or can't be read
    return {};
  }
}

// Function to remove files from the index if they no longer exist in the directory
async function removeDeletedFilesFromIndex(existingIndex, currentFiles) {
  const newIndex = { ...existingIndex };
  for (const file in existingIndex) {
    if (!currentFiles.includes(file)) {
      console.log(`Removing deleted file from index: ${file}`);
      delete newIndex[file]; // Remove the file from the index
    }
  }
  return newIndex;
}

// Function to create or update the index
async function createOrUpdateIndex(directoryPath, keywords, indexFilePath = 'index-txt.json') {
  try {
    // Load existing index
    const existingIndex = await loadExistingIndex(indexFilePath);

    // Read all files in the directory
    const files = await fs.readdir(directoryPath);
    const newIndex = { ...existingIndex };
    let processedCount = 0;
    let skippedCount = 0;

    // Remove deleted files from the index
    const updatedIndex = await removeDeletedFilesFromIndex(existingIndex, files);

    for (const file of files) {
      const ext = path.extname(file);
      if (ext === '.txt') {
        const filePath = path.join(directoryPath, file);

        // Get the last modified time of the current file
        const fileMTime = await getFileStats(filePath);

        // If the file has been modified since the last index or is not in the index, process it
        if (!existingIndex[file] || existingIndex[file].mtime < fileMTime) {
          const containsKeywords = await searchKeywordsInTxtFile(filePath, keywords);
          // Update the index with the new result and mtime
          updatedIndex[file] = {
            containsKeywords,
            mtime: fileMTime
          };
          processedCount++;
          console.log(`Processed file: ${file}`);
        } else {
          skippedCount++;
          console.log(`Skipped unchanged file: ${file}`);
        }
      }
    }

    // Save the updated index to a JSON file
    await fs.writeFile(indexFilePath, JSON.stringify(updatedIndex, null, 2));
    console.log(`Index updated successfully in ${indexFilePath}`);
    console.log(`Files processed: ${processedCount}`);
    console.log(`Files skipped: ${skippedCount}`);
  } catch (err) {
    console.error('Error updating index:', err);
  }
}

// Specify the directory and keywords to search
const directoryPath = 'c:/users/owner/downloads/listing/pages'; // Change this to the directory of your .txt files
const keywords = ['java', 'javascript', 'python']; // Change this to the list of keywords you want to search for
const indexFilePath = 'index-txt.json'; // Path to the index file

// Run the index creation/update
createOrUpdateIndex(directoryPath, keywords, indexFilePath);
