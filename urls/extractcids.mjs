import { exec } from 'child_process';
import fs from 'fs';

const rootCID = process.argv[2]; // Get root CID from command line argument
const outputFile = 'all_cids.txt';
const seenCIDs = new Set();

if (!rootCID) {
    console.error("Usage: node extractCIDs.mjs <rootCID>");
    process.exit(1);
}

// Function to execute a shell command and return its output
const runCommand = (cmd) => {
    return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                reject(`Error: ${stderr || error.message}`);
            } else {
                resolve(stdout);
            }
        });
    });
};

// Recursive function to extract child CIDs
const extractCIDs = async (cid) => {
    if (seenCIDs.has(cid)) return; // Avoid duplicate processing
    seenCIDs.add(cid);
    
    console.log(`Processing CID: ${cid}`);
    
    try {
        const output = await runCommand(`btfs ls ${cid}`);
        const childCIDs = output
            .split('\n')
            .map(line => line.split(' ')[0].trim()) // Extract first column (CID)
            .filter(c => c.startsWith('Qm')); // Ensure it's a valid CID
        
        for (const childCID of childCIDs) {
            await extractCIDs(childCID); // Recursively process child CIDs
        }
    } catch (err) {
        console.error(`Failed to process CID: ${cid}`, err);
    }
};

// Start processing and write results to file
const main = async () => {
    console.log(`Starting extraction from root CID: ${rootCID}`);
    await extractCIDs(rootCID);

    // Write all collected CIDs to a file
    fs.writeFileSync(outputFile, [...seenCIDs].join('\n'), 'utf-8');
    console.log(`Extraction complete! Saved ${seenCIDs.size} CIDs to ${outputFile}`);
};

// Run script
main();
