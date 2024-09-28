import { promises as fs } from 'fs';
import path from 'path';

const sourceDir = 'c:/users/owner/downloads/listing/pages'; // Replace with your source directory
const destDir = 'c:/users/owner/downloads/listing/500html'; // Replace with your destination directory
const fileCount = 500;

function getRandomSample(array, sampleSize) {
  const result = [];
  const taken = new Array(array.length);

  while (result.length < sampleSize) {
    const index = Math.floor(Math.random() * array.length);
    if (!taken[index]) {
      result.push(array[index]);
      taken[index] = true;
    }
  }

  return result;
}

async function moveFiles() {
  try {
    let files = await fs.readdir(sourceDir);
    files = files.filter(file => file.endsWith('.htm') || file.endsWith('.html') || file.endsWith('.xhtml'));

    const filesToMove = getRandomSample(files, Math.min(fileCount, files.length));

    for (const file of filesToMove) {
      const sourcePath = path.join(sourceDir, file);
      const destPath = path.join(destDir, file);
      await fs.rename(sourcePath, destPath);
      console.log(`Moved ${file} to ${destDir}`);
    }

    console.log(`Successfully moved ${filesToMove.length} HTML files.`);
  } catch (error) {
    console.error('Error:', error);
  }
}

moveFiles();
