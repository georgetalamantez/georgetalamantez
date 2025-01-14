import fs from 'fs/promises';
import path from 'path';

const indexFilePath = './index-txt.json';
const sourceDir = 'c:/users/owner/downloads/listing/pages';
const destinationDir = 'c:/users/owner/downloads/listing/500html';

async function moveFiles() {
  try {
    // Read and parse the index file
    const indexContent = await fs.readFile(indexFilePath, 'utf-8');
    const fileIndex = JSON.parse(indexContent);

    // Ensure the destination directory exists
    await fs.mkdir(destinationDir, { recursive: true });

    let movedCount = 0;

    // Iterate over files in the index
    for (const [fileName, isTrue] of Object.entries(fileIndex)) {
      if (isTrue) {
        const sourcePath = path.join(sourceDir, fileName);
        const destinationPath = path.join(destinationDir, fileName);

        try {
          // Move the file
          await fs.rename(sourcePath, destinationPath);
          console.log(`Moved: ${fileName}`);
          movedCount++;
        } catch (err) {
          if (err.code === 'ENOENT') {
            console.error(`File not found: ${fileName}`);
          } else {
            console.error(`Error moving file: ${fileName}`, err);
          }
        }
      }
    }

    console.log(`\nTotal files moved: ${movedCount}`);
  } catch (err) {
    console.error('Error reading index or processing files:', err);
  }
}

moveFiles();
