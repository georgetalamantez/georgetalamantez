import { promises as fs } from 'fs';
import path from 'path';

// Define the input file and output directory
const inputFile = 'c:/users/owner/downloads/listing/books/1.html'; // Update this to the correct path if needed
const outputDir = 'c:/users/owner/downloads/listing/ipfs/temp';

// Function to split the document by headings
async function splitByHeadings() {
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
    for (let i = 0; i < sections.length; i++) {
      const sectionFileName = path.join(outputDir, `section_${i + 1}.html`);
      await fs.writeFile(sectionFileName, sections[i], 'utf8');
      console.log(`Created: ${sectionFileName}`);
    }

    console.log('Document successfully split by headings.');
  } catch (error) {
    console.error('Error while splitting the document:', error);
  }
}

splitByHeadings();
