import { promises as fs } from 'fs';

const sourceDir = 'c:/users/owner/downloads/listing/pages';
const destDir = 'c:/users/owner/downloads/listing/500html';
const fileCount = 250;

// Generator function to yield random files
function* randomFileGenerator(files) {
  const remainingFiles = [...files];
  while (remainingFiles.length) {
    const randomIndex = Math.floor(Math.random() * remainingFiles.length);
    yield remainingFiles.splice(randomIndex, 1)[0];
  }
}

async function moveFiles() {
  try {
    let files = await fs.readdir(sourceDir);
    files = files.filter(file => file.endsWith('.txt'));

    const fileGen = randomFileGenerator(files);

    let movedCount = 0;
    for (const file of fileGen) {
      if (movedCount >= fileCount) break;

      const sourcePath = `${sourceDir}/${file}`;
      const destPath = `${destDir}/${file}`;
      await fs.rename(sourcePath, destPath);
      movedCount++;
      console.log(`Moved ${file} to ${destDir}`);
    }

    console.log(`Successfully moved ${movedCount} text files.`);
  } catch (error) {
    console.error('Error:', error);
  }
}

moveFiles();
