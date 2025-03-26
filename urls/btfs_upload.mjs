import fs from 'fs';
import fetch from 'node-fetch';
import FormData from 'form-data';
import path from 'path';

const BTFS_API = "http://localhost:5001/api/v1"; // Change if needed

// Function to recursively add files to FormData while preserving structure
function addFilesToFormData(form, dirPath, relativePath = "") {
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
        const fullPath = path.join(dirPath, file);
        const relPath = path.join(relativePath, file).replace(/\\/g, "/"); // Normalize path

        if (fs.statSync(fullPath).isDirectory()) {
            addFilesToFormData(form, fullPath, relPath); // Recursively add subfolders
        } else {
            form.append("file", fs.createReadStream(fullPath), relPath);
        }
    }
}

// Function to upload a directory with proper structure
async function uploadDirectory(directoryPath) {
    if (!fs.existsSync(directoryPath) || !fs.statSync(directoryPath).isDirectory()) {
        console.error("Invalid folder path:", directoryPath);
        process.exit(1);
    }

    const form = new FormData();
    addFilesToFormData(form, directoryPath); // Add all files and subfolders

    // Use wrap-with-directory to ensure a folder CID is created
    const response = await fetch(`${BTFS_API}/add?recursive=true&wrap-with-directory=true&pin=true`, {
        method: 'POST',
        body: form
    });

    const text = await response.text();
    console.log("Upload Response for Directory:", text);

    // Extract the final folder hash (which will be the last entry in the response)
    const matches = [...text.matchAll(/"Hash":"(.*?)"/g)];
    return matches.length ? matches[matches.length - 1][1] : null;
}

// Function to copy a folder in BTFS
async function copyFolder(sourceHash, destinationPath) {
    const url = `${BTFS_API}/files/cp?arg=/btfs/${sourceHash}&arg=${destinationPath}`;

    const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
    const text = await response.text();

    console.log(`Copy Response:`, text);
    return text;
}

// Main function
async function main() {
    // Get the folder path from command-line arguments
    const folderPath = process.argv[2];

    if (!folderPath) {
        console.error("Usage: node btfs_upload.mjs <folder_path>");
        process.exit(1);
    }

    try {
        console.log(`Uploading folder: ${folderPath}`);
        const folderHash = await uploadDirectory(folderPath);

        if (!folderHash) {
            console.error("Failed to extract folder hash!");
            return;
        }

        console.log(`Uploaded Folder Hash: ${folderHash}`);

        // Generate a destination path based on the folder name
        const folderName = path.basename(folderPath).replace(/\s+/g, "_"); // Replace spaces with underscores
        const destinationPath = `/nonferrous/${folderName}`;

        // Copy the folder in BTFS
        const copyResponse = await copyFolder(folderHash, destinationPath);

        console.log("Copy Completed:", copyResponse);
    } catch (error) {
        console.error("Error:", error);
    }
}

// Run the script
main();
