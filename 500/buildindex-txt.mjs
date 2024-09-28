import fs from 'fs/promises';
import path from 'path';

// Function to search keyword within a .txt file
async function searchKeywordInTxtFile(filePath, keyword) {
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    return fileContent.includes(keyword);
  } catch (err) {
    console.error(`Error reading file ${filePath}:`, err);
    return false;
  }
}

// Function to create an index of .txt files and whether they contain the keyword
async function createIndex(directoryPath, keyword) {
  try {
    const files = await fs.readdir(directoryPath);
    const index = {};

    for (const file of files) {
      const ext = path.extname(file);
      if (ext === '.txt') {
        const filePath = path.join(directoryPath, file);
        const containsKeyword = await searchKeywordInTxtFile(filePath, keyword);
        index[file] = containsKeyword;
      }
    }

    // Save the index to a JSON file
    await fs.writeFile('index-txt.json', JSON.stringify(index, null, 2));
    console.log('Index created successfully in index-txt.json');
  } catch (err) {
    console.error('Error creating index:', err);
  }
}

// Specify the directory and keyword to search
const directoryPath = 'c:/users/owner/downloads/listing/pages'; // Change this to the directory of your .txt files
const keyword = 'listing'; // Change this to the keyword you want to search for

createIndex(directoryPath, keyword);
