import { readFileSync, writeFileSync } from 'fs';

// Function to delete every other line from the file
function deleteEveryOtherLine(filePath) {
    // Read the file content as an array of lines
    const fileContent = readFileSync(filePath, 'utf-8').split('\n');
    
    // Filter out every other line (keeping only odd-numbered lines)
    const filteredContent = fileContent.filter((line, index) => index % 2 === 0);
    
    // Write the filtered content back to the file
    writeFileSync(filePath, filteredContent.join('\n'), 'utf-8');
    
    console.log(`Processed ${filePath}: Every other line deleted.`);
}

// Path to your .txt file
const filePath = './log.txt'; // Replace with the actual path to your file

deleteEveryOtherLine(filePath);
