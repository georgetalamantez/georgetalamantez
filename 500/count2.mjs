import { promises as fs } from 'fs';
import path from 'path';

async function countFiles(directory) {
    const files = await fs.readdir(directory, { withFileTypes: true });
    const counts = {};

    for (const file of files) {
        if (file.isDirectory()) {
            const subCounts = await countFiles(path.join(directory, file.name));
            for (const [ext, count] of Object.entries(subCounts)) {
                counts[ext] = (counts[ext] || 0) + count;
            }
        } else {
            const ext = path.extname(file.name) || 'no_extension';
            counts[ext] = (counts[ext] || 0) + 1;
        }
    }

    return counts;
}

async function main() {
    const directory = 'C:\\Users\\Owner\\Downloads\\Listing\\Pages';
    const counts = await countFiles(directory);
    let totalFiles = 0;

    for (const [ext, count] of Object.entries(counts)) {
        console.log(`.${ext === 'no_extension' ? '(no extension)' : ext}: ${count}`);
        totalFiles += count;
    }

    console.log(`Total files: ${totalFiles}`);
}

main().catch(console.error);
