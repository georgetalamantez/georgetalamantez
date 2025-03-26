import { exec } from 'child_process';
import fs from 'fs';
import readline from 'readline';

const inputFile = 'cids.txt';  // File containing the list of CIDs
const outputFile = 'all_cids.txt';
const seenCIDs = new Set(); // Store unique CIDs

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

// Function to process a CID (runs `btfs ls`)
const processCID = async (cid) => {
    try {
        console.log(`Processing CID: ${cid}`);
        const output = await runCommand(`btfs ls ${cid}`);
        const childCIDs = output
            .split('\n')
            .map(line => line.split(' ')[0].trim()) // Extract first column (CID)
            .filter(c => c.startsWith('Qm')); // Ensure it's a valid CID
        
        for (const childCID of childCIDs) {
            seenCIDs.add(childCID);
        }
    } catch (err) {
        console.error(`Failed to process CID: ${cid}`, err);
    }
};

// Main function to read CIDs from file and process them
const main = async () => {
    console.log(`Reading CIDs from ${inputFile}...`);
    
    if (!fs.existsSync(inputFile)) {
        console.error(`Error: File "${inputFile}" not found.`);
        process.exit(1);
    }

    const fileStream = fs.createReadStream(inputFile);
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    for await (const cid of rl) {
        if (cid.trim()) {
            await processCID(cid.trim());
        }
    }

    // Write results to output file
    fs.writeFileSync(outputFile, [...seenCIDs].join('\n'), 'utf-8');
    console.log(`Processing complete! Collected ${seenCIDs.size} child CIDs.`);
    console.log(`Saved results to ${outputFile}`);
};

// Run script
main();
