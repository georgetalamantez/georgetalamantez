import { promises as fs } from 'fs';
import path from 'path';

const sourceDir = 'c:/users/owner/downloads/listing/pages';
const destDir = 'c:/users/owner/downloads/listing/500html';
const fileCount = 250;

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
    files = files.filter(file => file.endsWith('.htm') || file.endsWith('.html') || file.endsWith('.xhtml'));

    const fileGen = randomFileGenerator(files);

    let movedCount = 0;
    for (const file of fileGen) {
      if (movedCount >= fileCount) break;
      
      const sourcePath = path.join(sourceDir, file);
      
      // Read the file contents and check its length
      const fileContent = await fs.readFile(sourcePath, 'utf8');
      const charCount = fileContent.length;

      if (charCount >= 2000 && charCount <= 30000) {
        const destPath = path.join(destDir, file);
        await fs.rename(sourcePath, destPath);
        movedCount++;
        console.log(`Moved ${file} with ${charCount} characters to ${destDir}`);
      } else {
        console.log(`Skipped ${file} with ${charCount} characters (out of range)`);
      }
    }

    console.log(`Successfully moved ${movedCount} HTML files.`);
  } catch (error) {
    console.error('Error:', error);
  }
}

moveFiles();
