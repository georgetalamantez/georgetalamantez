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
async function createOrUpdateIndex(directoryPath, indexFilePath = 'index-txt.json') {
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

        // If the file is not in the index or has been modified, process it
        if (!existingIndex[file] || existingIndex[file].mtime < fileMTime) {
          const title = file; // Set title to the file name
          const keywords = ['java', 'javascript', 'python']; // Placeholder for keywords

          // Here, you can implement a logic to extract keywords if needed
          // For example, you could call your existing keyword extraction logic

          // Update the index with the new result and mtime
          updatedIndex[file] = {
            title,
            keyword1: keywords[0] || null,
            keyword2: keywords[1] || null,
            keyword3: keywords[2] || null,
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

// Specify the directory and index file
const directoryPath = 'c:/users/owner/downloads/listing/pages'; // Change this to the directory of your .txt files
const indexFilePath = 'index-txt.json'; // Path to the index file

// Run the index creation/update
createOrUpdateIndex(directoryPath, indexFilePath);
