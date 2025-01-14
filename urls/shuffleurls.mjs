import fs from 'fs';
import path from 'path';

const inputFilePath = './log.txt'; // Replace with your actual file path
const outputFilePath = './shuffled_log.txt';

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

async function shuffleUrls(inputPath, outputPath) {
    try {
        const data = await fs.promises.readFile(inputPath, 'utf8');
        const urls = data.split('\n').filter(line => line.trim() !== ''); // Remove empty lines
        shuffleArray(urls);
        await fs.promises.writeFile(outputPath, urls.join('\n'), 'utf8');
        console.log(`Shuffled URLs written to ${outputPath}`);
    } catch (err) {
        console.error('Error:', err.message);
    }
}

shuffleUrls(inputFilePath, outputFilePath);
