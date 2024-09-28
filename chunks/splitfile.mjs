import fs from 'fs/promises';
import path from 'path';

const inputFilePath = 'c:\\users\\owner\\downloads\\listing\\ipfs\\temp\\1.txt';
const outputDir = 'c:\\users\\owner\\downloads\\listing\\ipfs\\temp\\chunks';
const chunkSize = 30000;

async function splitFileIntoChunks() {
    try {
        // Read the input file
        const data = await fs.readFile(inputFilePath, 'utf-8');
        
        // Ensure the output directory exists
        await fs.mkdir(outputDir, { recursive: true });

        // Split the data into chunks
        let currentIndex = 0;
        let chunkNumber = 1;

        while (currentIndex < data.length) {
            const chunk = data.substring(currentIndex, currentIndex + chunkSize);
            const chunkFileName = `chunk_${chunkNumber}.txt`;
            const chunkFilePath = path.join(outputDir, chunkFileName);

            // Write the chunk to a new file
            await fs.writeFile(chunkFilePath, chunk, 'utf-8');
            console.log(`Created ${chunkFilePath}`);

            currentIndex += chunkSize;
            chunkNumber++;
        }

        console.log('File split successfully.');
    } catch (error) {
        console.error('Error while splitting the file:', error);
    }
}

splitFileIntoChunks();
