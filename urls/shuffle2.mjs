import fs from 'fs';

/**
 * Enhanced Shuffle Algorithm
 * Shuffles URLs such that middle elements are preferentially moved to the top or bottom.
 * @param {Array} array - The array to shuffle.
 */
function enhancedShuffle(array) {
    const midStart = Math.floor(array.length / 3);
    const midEnd = Math.floor((array.length / 3) * 2);
    const middleElements = array.slice(midStart, midEnd);

    // Remove the middle section from the array
    const remainingElements = [...array.slice(0, midStart), ...array.slice(midEnd)];

    // Shuffle the middle section and split it into two groups
    middleElements.sort(() => Math.random() - 0.5);
    const toTop = middleElements.slice(0, Math.floor(middleElements.length / 2));
    const toBottom = middleElements.slice(Math.floor(middleElements.length / 2));

    // Shuffle remaining elements
    remainingElements.sort(() => Math.random() - 0.5);

    // Combine: top -> shuffled middle -> remaining -> bottom
    return [...toTop, ...remainingElements, ...toBottom];
}

/**
 * Reads a file, shuffles its lines with enhanced logic, and writes to a new file.
 * @param {string} inputPath - Path to the input file.
 * @param {string} outputPath - Path to the output file.
 */
async function shuffleUrls(inputPath, outputPath) {
    try {
        console.log('Reading file...');
        const data = await fs.promises.readFile(inputPath, 'utf8');
        const urls = data.split('\n').filter(line => line.trim() !== ''); // Remove empty lines

        console.log('Shuffling URLs with enhanced algorithm...');
        const shuffledUrls = enhancedShuffle(urls);

        console.log('Writing shuffled URLs to file...');
        await fs.promises.writeFile(outputPath, shuffledUrls.join('\n'), 'utf8');
        console.log(`Shuffled URLs written to ${outputPath}`);
    } catch (err) {
        console.error('Error:', err.message);
    }
}

// Input and output file paths
const inputFilePath = './log.txt'; // Replace with your actual file path
const outputFilePath = './shuffled_log_enhanced.txt';

// Run the script
shuffleUrls(inputFilePath, outputFilePath);
