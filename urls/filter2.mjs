import { readFileSync, writeFileSync } from 'fs';

// Function to filter URLs based on query parameter, file extension, and shuffle them
function filterAndShuffleUrls(filePath, extensions) {
    // Read the file content as an array of lines
    const fileContent = readFileSync(filePath, 'utf-8').split('\n');
    
    // Filter lines that contain '?filename=' and end with the specified extensions
    const filteredContent = fileContent.filter((line) => {
        const trimmedLine = line.trim();
        return (
            trimmedLine.includes('?filename=') &&
            extensions.some((ext) => trimmedLine.endsWith(ext))
        );
    });

    // Shuffle the filtered content
    for (let i = filteredContent.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [filteredContent[i], filteredContent[j]] = [filteredContent[j], filteredContent[i]];
    }

    // Write the shuffled content back to the file
    writeFileSync(filePath, filteredContent.join('\n'), 'utf-8');
    
    console.log(`Processed ${filePath}: Filtered and shuffled URLs with '?filename=' and specified extensions.`);
}

// Path to your .txt file
const filePath = './log.txt'; // Replace with the actual path to your file

// File extensions to keep
const extensionsToKeep = ['.flac', '.mp3'];

filterAndShuffleUrls(filePath, extensionsToKeep);
