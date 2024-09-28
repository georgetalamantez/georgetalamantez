import { promises as fs } from 'fs';

const sourceDir = 'c:/users/owner/downloads/listing/pages';
const destDir = 'c:/users/owner/downloads/listing/500html';
const fileCount = 500;

// Function to get a random sample from an array
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
    files = files.filter(file => file.endsWith('.txt'));

    const filesToMove = getRandomSample(files, Math.min(fileCount, files.length));

    for (const file of filesToMove) {
      const sourcePath = `${sourceDir}/${file}`;
      const destPath = `${destDir}/${file}`;
      await fs.rename(sourcePath, destPath);
      console.log(`Moved ${file} to ${destDir}`);
    }

    console.log(`Successfully moved ${filesToMove.length} text files.`);
  } catch (error) {
    console.error('Error:', error);
  }
}

moveFiles();
