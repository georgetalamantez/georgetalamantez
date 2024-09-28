import fs from 'fs/promises';
import path from 'path';

async function countHTMFiles(directory) {
    try {
        const files = await fs.readdir(directory);
        const htmFiles = files.filter(file => path.extname(file).toLowerCase() === '.htm');
        console.log(`Number of .htm files: ${htmFiles.length}`);
    } catch (err) {
        console.error('Error reading directory:', err);
    }
}

const directoryPath = 'C:\\Users\\Owner\\Downloads\\listing\\pages';
countHTMFiles(directoryPath);
