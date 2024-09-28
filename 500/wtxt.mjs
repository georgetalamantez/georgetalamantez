import { promises as fs } from 'fs';
import path from 'path';

const sourceDir = 'c:/users/owner/downloads/listing/pages';
const destDir = 'c:/users/owner/downloads/listing/500html';
const fileCount = 500;

// Function to assign a weight to each file (you can customize this function)
async function calculateWeight(file) {
  // Example: Assign higher weight to larger files
  const stats = await fs.stat(`${sourceDir}/${file}`);
  return stats.size;
}

function weightedRandomSelection(files, weights) {
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const random = Math.random() * totalWeight;
  let cumulativeWeight = 0;

  for (let i = 0; i < files.length; i++) {
    cumulativeWeight += weights[i];
    if (random < cumulativeWeight) {
      return files[i];
    }
  }
}

async function moveFiles() {
  try {
    let files = await fs.readdir(sourceDir);
    files = files.filter(file => file.endsWith('.txt'));

    const weights = await Promise.all(files.map(file => calculateWeight(file)));
    const selectedFiles = new Set();

    while (selectedFiles.size < Math.min(fileCount, files.length)) {
      const selectedFile = weightedRandomSelection(files, weights);
      selectedFiles.add(selectedFile);
    }

    for (const file of selectedFiles) {
      const sourcePath = `${sourceDir}/${file}`;
      const destPath = `${destDir}/${file}`;
      await fs.rename(sourcePath, destPath);
      console.log(`Moved ${file} to ${destDir}`);
    }

    console.log(`Successfully moved ${selectedFiles.size} text files.`);
  } catch (error) {
    console.error('Error:', error);
  }
}

moveFiles();
