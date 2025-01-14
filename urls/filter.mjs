import { readFileSync, writeFileSync } from 'fs';

// Function to filter URLs based on file extension
function filterUrlsByExtension(filePath, extensions) {
    // Read the file content as an array of lines
    const fileContent = readFileSync(filePath, 'utf-8').split('\n');
    
    // Filter lines that end with the specified extensions
    const filteredContent = fileContent.filter((line) =>
        extensions.some((ext) => line.trim().endsWith(ext))
    );
    
    // Write the filtered content back to the file
    writeFileSync(filePath, filteredContent.join('\n'), 'utf-8');
    
    console.log(`Processed ${filePath}: Filtered to include only specified extensions.`);
}

// Path to your .txt file
const filePath = './log.txt'; // Replace with the actual path to your file

// File extensions to keep
const extensionsToKeep = ['.flac', '.mp3'];

filterUrlsByExtension(filePath, extensionsToKeep);
