import { promises as fs } from 'fs';
import path from 'path';

const sourceDir = 'c:/users/owner/downloads/listing/pages'; // Source directory
const indexFile = './index-html.json'; // Index file
const deleteKeywords = ['acknowledge', 'book quality', 'contents', 'preface', 'notice']; // Keywords to delete

async function deleteFilesAndLog() {
  try {
    // Load the existing index
    const indexData = await fs.readFile(indexFile, 'utf-8');
    const index = JSON.parse(indexData);

    let deleteCount = 0;
    let filesToDelete = [];

    // Search for deleteKeywords in the stored headings
    for (const [file, data] of Object.entries(index)) {
      const { headings } = data;

      // Skip the metadata for keywords in the index (_keywords field)
      if (file === '_keywords') {
        continue;
      }

      // Check if the heading contains any deleteKeywords
      const containsDeleteKeyword = deleteKeywords.some(keyword => headings.toLowerCase().includes(keyword));

      if (containsDeleteKeyword) {
        const filePath = path.join(sourceDir, file);
        try {
          await fs.unlink(filePath); // Delete the file
          filesToDelete.push(file); // Keep track of deleted files
          console.log(`Deleted file ${file} due to "${keyword}" in heading.`);
        } catch (err) {
          console.error(`Failed to delete file ${file}:`, err);
        }
        deleteCount++;
      }
    }

    // Remove deleted files from the index
    filesToDelete.forEach(file => delete index[file]);

    // Save the updated index
    await fs.writeFile(indexFile, JSON.stringify(index, null, 2), 'utf-8');

    // Log the results
    const remainingEntries = Object.keys(index).length - (index['_keywords'] ? 1 : 0); // Exclude _keywords if present
    console.log(`Deleted ${deleteCount} files.`);
    console.log(`Remaining entries in the index: ${remainingEntries}`);

  } catch (error) {
    console.error('Error processing files:', error);
  }
}

// Run the function
deleteFilesAndLog();
