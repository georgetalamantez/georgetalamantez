import { promises as fs } from 'fs';
import path from 'path';

async function countFiles(directory) {
    const files = await fs.readdir(directory, { withFileTypes: true });
    const counts = {};
    let totalSize = 0; // Initialize total size

    for (const file of files) {
        const fullPath = path.join(directory, file.name);

        if (file.isDirectory()) {
            const { counts: subCounts, totalSize: subTotalSize } = await countFiles(fullPath);
            for (const [ext, count] of Object.entries(subCounts)) {
                counts[ext] = (counts[ext] || 0) + count;
            }
            totalSize += subTotalSize; // Add the size of subdirectories
        } else {
            const ext = path.extname(file.name) || 'no_extension';
            const stats = await fs.stat(fullPath); // Get the file stats
            totalSize += stats.size; // Add file size in bytes
            counts[ext] = (counts[ext] || 0) + 1;
        }
    }

    return { counts, totalSize };
}

async function main() {
    const directory = 'C:\\Users\\Owner\\Downloads\\Listing\\ipfs\\temp';
    const { counts, totalSize } = await countFiles(directory);
    let totalFiles = 0;

    for (const [ext, count] of Object.entries(counts)) {
        console.log(`.${ext === 'no_extension' ? '(no extension)' : ext}: ${count}`);
        totalFiles += count;
    }

    console.log(`Total files: ${totalFiles}`);

    // Convert total size from bytes to MB or GB
    const sizeInMB = totalSize / (1024 * 1024);
    const sizeInGB = totalSize / (1024 * 1024 * 1024);

    console.log(`Total size: ${sizeInMB.toFixed(2)} MB (${sizeInGB.toFixed(2)} GB)`);
}

main().catch(console.error);
