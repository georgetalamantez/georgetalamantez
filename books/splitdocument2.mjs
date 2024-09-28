import { promises as fs } from 'fs';
import path from 'path';

// Define the input directory and output directory
const inputDir = 'c:/users/owner/downloads/ipfs/temp'; // Update this to the correct path if needed
const outputDir = 'c:/users/owner/downloads/listing/ipfs/temp';

// Function to split a document by headings
async function splitByHeadings(inputFile) {
  try {
    // Read the entire HTML file
    const content = await fs.readFile(inputFile, 'utf8');

    // Regular expression to match the headings (e.g., <h1>, <h2>, etc.)
    const headingRegex = /<h[1-6].*?>(.*?)<\/h[1-6]>/g;

    // Array to store the sections
    let sections = [];
    let match;
    let lastIndex = 0;

    // Iterate over each heading and split the content accordingly
    while ((match = headingRegex.exec(content)) !== null) {
      const heading = match[0];
      const section = content.slice(lastIndex, match.index); // Content before the heading
      lastIndex = match.index; // Update the last index for the next section

      if (section.trim()) {
        sections.push(section.trim());
      }
    }

    // Add the final section after the last heading
    const lastSection = content.slice(lastIndex);
    if (lastSection.trim()) {
      sections.push(lastSection.trim());
    }

    // Ensure the output directory exists
    await fs.mkdir(outputDir, { recursive: true });

    // Write each section to a new file
    const baseName = path.basename(inputFile, path.extname(inputFile)); // Get base name without extension
    for (let i = 0; i < sections.length; i++) {
      const sectionFileName = path.join(outputDir, `${baseName}_section_${i + 1}.html`);
      await fs.writeFile(sectionFileName, sections[i], 'utf8');
      console.log(`Created: ${sectionFileName}`);
    }

    console.log(`Document ${inputFile} successfully split by headings.`);
  } catch (error) {
    console.error(`Error while splitting the document ${inputFile}:`, error);
  }
}

// Function to process all files in the input directory
async function processAllFiles() {
  try {
    const files = await fs.readdir(inputDir);

    for (const file of files) {
      const filePath = path.join(inputDir, file);

      // Check if it's an HTML file
      if (path.extname(filePath).toLowerCase() === '.html') {
        await splitByHeadings(filePath);
      }
    }

    console.log('All files processed successfully.');
  } catch (error) {
    console.error('Error while processing files:', error);
  }
}

processAllFiles();
