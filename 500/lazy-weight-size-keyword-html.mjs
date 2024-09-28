import { promises as fs } from 'fs';
import path from 'path';
import { createReadStream } from 'fs';
import { createInterface } from 'readline';

const sourceDir = 'c:/users/owner/downloads/listing/pages'; // Source directory
const destDir = 'c:/users/owner/downloads/listing/500html'; // Destination directory
const fileCount = 250;
const keywords = ['listing', 'literature review', 'related work', 'conclusion', 'summary']; // Keywords to look for
const batchSize = 2000; // Adjust this size based on your available memory
const minChars = 2000; // Minimum number of characters
const maxChars = 30000; // Maximum number of characters

// Function to calculate weight based on keywords using streams
async function calculateWeight(file) {
  let weight = 0;
  let charCount = 0;
  const fileStream = createReadStream(path.join(sourceDir, file), 'utf-8');

  const rl = createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    charCount += line.length; // Count characters

    for (const keyword of keywords) {
      if (line.toLowerCase().includes(keyword)) {
        weight += 1; // Adjust weight increment as needed
      }
    }

    // If the file exceeds maxChars, we can stop early
    if (charCount > maxChars) {
      return { weight: 0, charCount };
    }
  }

  // Only return the weight if the character count is within the specified range
  if (charCount >= minChars && charCount <= maxChars) {
    return { weight, charCount };
  } else {
    return { weight: 0, charCount }; // If not within the range, return 0 weight
  }
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

// Function to read files with a limit on concurrent reads
async function readFilesWithLimit(files) {
  const weights = [];

  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    const batchWeights = await Promise.all(
      batch.map(async file => {
        const { weight, charCount } = await calculateWeight(file);
        return weight;
      })
    );
    weights.push(...batchWeights);
  }

  return weights;
}

async function moveFiles() {
  try {
    let files = await fs.readdir(sourceDir);
    files = files.filter(file => file.endsWith('.htm') || file.endsWith('.html') || file.endsWith('.xhtml'));

    // Calculate weights based on keywords and file character count
    const weights = await readFilesWithLimit(files);
    const fileGen = weightedFileGenerator(files, weights);

    let movedCount = 0;
    let selectedFiles = [];

    for await (const file of fileGen) {
      if (movedCount >= fileCount) break;

      const sourcePath = path.join(sourceDir, file);
      const destPath = path.join(destDir, file); // Corrected this line
      await fs.rename(sourcePath, destPath);
      movedCount++;
      selectedFiles.push(file);
      console.log(`Moved ${file} to ${destDir}`);
    }

    // Fallback: If not enough files are selected, select the remaining files randomly
    if (movedCount < fileCount) {
      console.warn(`Only moved ${movedCount} files. Less than ${fileCount} HTML files found.`);
      
      const remainingFiles = files.filter(file => !selectedFiles.includes(file));
      const additionalFiles = remainingFiles.slice(0, fileCount - movedCount);

      for (const file of additionalFiles) {
        const sourcePath = path.join(sourceDir, file);
        const destPath = path.join(destDir, file); // Corrected this line
        await fs.rename(sourcePath, destPath);
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
