import { promises as fs } from 'fs';
import path from 'path';

const sourceDir = 'c:/users/owner/downloads/listing/pages'; // Source directory
const destDir = 'c:/users/owner/downloads/listing/500html'; // Destination directory
const fileCount = 500;

// Function to calculate weight (e.g., based on file size)
async function calculateWeight(file) {
  const stats = await fs.stat(path.join(sourceDir, file));
  return Math.pow(stats.size, 1.5);  // Increase weight for larger files exponentially
}

// Generator function to yield files and their weights lazily
async function* weightedFileGenerator(files) {
  for (const file of files) {
    const weight = await calculateWeight(file);
    yield { file, weight };  // Yield each file with its corresponding weight
  }
}

async function moveFiles() {
  try {
    // Get list of files and filter only HTML/XHTML files
    let files = await fs.readdir(sourceDir);
    files = files.filter(file => file.endsWith('.txt'));

    const fileGen = weightedFileGenerator(files);  // Create the generator

    let movedCount = 0;
    let selectedFiles = [];

    for await (const { file, weight } of fileGen) {
      if (movedCount >= fileCount) break;  // Stop when we've moved enough files

      const sourcePath = path.join(sourceDir, file);
      const destPath = path.join(destDir, file);
      await fs.rename(sourcePath, destPath);  // Move the file
      movedCount++;
      selectedFiles.push(file);

      console.log(`Moved ${file} to ${destDir} with weight ${weight}`);
    }

    // If not enough files are moved, move more randomly
    if (movedCount < fileCount) {
      console.warn(`Only moved ${movedCount} files. Less than ${fileCount} HTML files found.`);
      
      const remainingFiles = files.filter(file => !selectedFiles.includes(file));
      const additionalFiles = remainingFiles.slice(0, fileCount - movedCount);

      for (const file of additionalFiles) {
        const sourcePath = path.join(sourceDir, file);
        const destPath = path.join(destDir, file);
        await fs.rename(sourcePath, destPath);  // Move remaining files
        movedCount++;
        console.log(`Moved ${file} to ${destDir}`);
      }

      console.log(`In total, moved ${movedCount} HTML files.`);
    } else {
      console.log(`Successfully moved ${movedCount} HTML files.`);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

moveFiles();
