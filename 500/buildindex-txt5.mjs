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

// Function to search multiple keywords within a .txt file using regex for wildcard support
async function searchKeywordsInTxtFile(filePath, keywords) {
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    
    // Convert keywords into regex patterns (replace '*' with '.*' for wildcard)
    const regexPatterns = keywords.map(keyword => 
      new RegExp(keyword.replace('*', '.*'), 'i') // 'i' for case-insensitive matching
    );

    // Check if any regex pattern matches the file content
    return regexPatterns.some(regex => regex.test(fileContent));
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
          newIndex[file] = {
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
    await fs.writeFile(indexFilePath, JSON.stringify(newIndex, null, 2));
    console.log(`Index updated successfully in ${indexFilePath}`);
    console.log(`Files processed: ${processedCount}`);
    console.log(`Files skipped: ${skippedCount}`);
  } catch (err) {
    console.error('Error updating index:', err);
  }
}

// Specify the directory and keywords to search
const directoryPath = 'c:/users/owner/downloads/listing/pages'; // Change this to the directory of your .txt files
const keywords = ['listing', 'package', 'recipe', 'example', 'import *']; // You can use wildcards like 'import *'
const indexFilePath = 'index-txt.json'; // Path to the index file

// Run the index creation/update
createOrUpdateIndex(directoryPath, keywords, indexFilePath);
