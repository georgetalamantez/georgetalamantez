import fs from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

// Path to input file
const inputFile = 'cids.txt';
const outputFile = 'ids.txt';

// Function to extract CIDs
async function extractCIDs(filePath) {
    try {
        const content = await fs.readFile(filePath, 'utf-8');
        const cids = content.match(/Qm[a-zA-Z0-9]{44}/g); // Regex to match CIDs
        return cids || [];
    } catch (err) {
        console.error('Error reading file:', err);
        return [];
    }
}

// Function to upload CIDs and log output
async function uploadCIDs(cids) {
    const results = [];

    for (const cid of cids) {
        console.log(`Uploading CID: ${cid}...`);

        try {
            const { stdout, stderr } = await execPromise(`btfs storage upload ${cid}`);
            results.push(`CID: ${cid}\nOutput:\n${stdout}\nError:\n${stderr}\n`);
        } catch (error) {
            results.push(`CID: ${cid}\nError: ${error.message}\n`);
        }
    }

    return results;
}

// Main execution
async function main() {
    const cids = await extractCIDs(inputFile);

    if (cids.length === 0) {
        console.log('No CIDs found.');
        return;
    }

    console.log(`Found ${cids.length} CIDs. Uploading...`);
    
    const logs = await uploadCIDs(cids);

    // Write results to ids.txt
    await fs.writeFile(outputFile, logs.join('\n' + '-'.repeat(40) + '\n'), 'utf-8');

    console.log(`Upload complete. Logs saved to ${outputFile}`);
}

main().catch(console.error);
