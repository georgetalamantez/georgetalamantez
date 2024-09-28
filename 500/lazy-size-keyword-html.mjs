import { promises as fs } from 'fs';
import path from 'path';
import { createReadStream } from 'fs';
import { createInterface } from 'readline';

const sourceDir = 'c:/users/owner/downloads/listing/pages'; // Source directory
const destDir = 'c:/users/owner/downloads/listing/500html'; // Destination directory
const fileCount = 250;
const keywords = ['listing', 'literature review', 'related work', 'conclusion', 'summary']; // Keywords to look for
const minChars = 2000; // Minimum number of characters
const maxChars = 30000; // Maximum number of characters

// Function to check for keywords and enforce character count limits
async function checkFileCriteria(file) {
  let containsKeyword = false;
  let charCount = 0;
  const fileStream = createReadStream(path.join(sourceDir, file), 'utf-8');

  const rl = createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    charCount += line.length; // Count characters

    // Check for keywords lazily as we read lines
    for (const keyword of keywords) {
      if (line.toLowerCase().includes(keyword)) {
        containsKeyword = true;
        break; // Once a keyword is found, no need to check further
      }
    }

    // If the file exceeds maxChars, stop early
    if (charCount > maxChars) {
      return { valid: false, charCount };
    }
  }

  // Return valid only if keywords are found and character count is within range
  if (containsKeyword && charCount >= minChars && charCount <= maxChars) {
    return { valid: true, charCount };
  } else {
    return { valid: false, charCount }; // If criteria not met, return invalid
  }
}

// Main function to move files based on keyword and size criteria
async function moveFiles() {
  try {
    let files = await fs.readdir(sourceDir);
    files = files.filter(file => file.endsWith('.htm') || file.endsWith('.html') || file.endsWith('.xhtml'));

    let validFiles = [];

    // Check each file lazily based on keywords and character count
    for (const file of files) {  // Fixed the syntax of the for-loop
      const { valid, charCount } = await checkFileCriteria(file);
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
