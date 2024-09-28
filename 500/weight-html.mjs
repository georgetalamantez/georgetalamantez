import { promises as fs } from 'fs';
import path from 'path';

const sourceDir = 'c:/users/owner/downloads/listing/pages'; // Source directory
const destDir = 'c:/users/owner/downloads/listing/500html'; // Destination directory
const fileCount = 500;

// Function to assign a weight to each file (based on file size in this example)
async function calculateWeight(file) {
  const stats = await fs.stat(path.join(sourceDir, file));
  return stats.size; // Weight is based on the file size
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
    files = files.filter(file => file.endsWith('.htm') || file.endsWith('.html') || file.endsWith('.xhtml'));

    const weights = await Promise.all(files.map(file => calculateWeight(file)));
    const selectedFiles = new Set();

    while (selectedFiles.size < Math.min(fileCount, files.length)) {
      const selectedFile = weightedRandomSelection(files, weights);
      selectedFiles.add(selectedFile);
    }

    for (const file of selectedFiles) {
      const sourcePath = path.join(sourceDir, file);
      const destPath = path.join(destDir, file);
      await fs.rename(sourcePath, destPath);
      console.log(`Moved ${file} to ${destDir}`);
    }

    console.log(`Successfully moved ${selectedFiles.size} HTML files.`);
  } catch (error) {
    console.error('Error:', error);
  }
}

moveFiles();
