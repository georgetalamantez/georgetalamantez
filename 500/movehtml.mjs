import { promises as fs } from 'fs';
import path from 'path';

const sourceDir = 'c:/users/owner/downloads/listing/pages'; // Replace with your source directory (use forward slashes for clarity)
const destDir = 'c:/users/owner/downloads/listing/500html'; // Replace with your destination directory (use forward slashes for clarity)
const fileCount = 500;

async function moveFiles() {
  try {
    const files = await fs.readdir(sourceDir);
    let movedCount = 0;

    for (const file of files) {
      if ((file.endsWith('.htm') || file.endsWith('.html') || file.endsWith('.xhtml')) && movedCount < fileCount) {
        const sourcePath = path.join(sourceDir, file);
        const destPath = path.join(destDir, file);
        await fs.rename(sourcePath, destPath);
        movedCount++;
        console.log(`Moved ${file} to ${destDir}`);
      }
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
