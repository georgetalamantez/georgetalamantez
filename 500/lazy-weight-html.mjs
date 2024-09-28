import { promises as fs } from 'fs';
import path from 'path';

const sourceDir = 'c:/users/owner/downloads/listing/pages'; // Source directory
const destDir = 'c:/users/owner/downloads/listing/500html'; // Destination directory
const fileCount = 500;

// Function to calculate weight (e.g., based on file size)
async function calculateWeight(file) {
  const stats = await fs.stat(path.join(sourceDir, file));
  return stats.size; // Weight based on file size
}

// Generator function to yield files based on weighted probability
async function* weightedFileGenerator(files, weights) {
  const remainingFiles = [...files];
  const remainingWeights = [...weights];

  while (remainingFiles.length) {
    const totalWeight = remainingWeights.reduce((sum, weight) => sum + weight, 0);
    const random = Math.random() * totalWeight;
    let cumulativeWeight = 0;

    for (let i = 0; i < remainingFiles.length; i++) {
      cumulativeWeight += remainingWeights[i];
      if (random < cumulativeWeight) {
        const [file] = remainingFiles.splice(i, 1);
        const [weight] = remainingWeights.splice(i, 1);
        yield file;
        break;
      }
    }
  }
}

async function moveFiles() {
  try {
    let files = await fs.readdir(sourceDir);
    files = files.filter(file => file.endsWith('.htm') || file.endsWith('.html') || file.endsWith('.xhtml'));

    const weights = await Promise.all(files.map(file => calculateWeight(file)));
    const fileGen = weightedFileGenerator(files, weights);

    let movedCount = 0;
    for await (const file of fileGen) {
      if (movedCount >= fileCount) break;

      const sourcePath = path.join(sourceDir, file);
      const destPath = path.join(destDir, file);
      await fs.rename(sourcePath, destPath);
      movedCount++;
      console.log(`Moved ${file} to ${destDir}`);
    }

    if (movedCount < fileCount) {
      console.warn(`Only moved ${movedCount} files. Less than ${fileCount} HTML files found.`);
    } else {
      console.log(`Successfully moved ${movedCount} HTML files.`);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

moveFiles();
