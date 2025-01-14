import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import FormData from 'form-data';

const sessionFile = "c:/users/owner/downloads/request_session.txt";
const folderPath = "c:/users/owner/downloads/listing/libgen";

// Extract the cookie from the session file
function extractCookie(sessionFile) {
    const data = fs.readFileSync(sessionFile, 'utf8');
    const cookieMatch = data.match(/Cookie: (.*)/);
    return cookieMatch ? cookieMatch[1] : null;
}

// Upload file with retry logic
async function uploadFile(filePath, cookie) {
    const url = "https://finder.btfs.io/api/v1/gateway/upload_file";
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0',
        'Cookie': cookie
    };

    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    formData.append('tags', '');
    formData.append('describe', '');
    formData.append('nameless', 'false');
    formData.append('is_private', 'false');
    formData.append('encrypted', 'false');

    for (let attempt = 1; attempt <= 3; attempt++) {
        console.log(`Uploading: ${filePath} (Attempt ${attempt})`);
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { ...headers, ...formData.getHeaders() },
                body: formData
            });

            const responseBody = await response.json();
            if (response.ok) {
                console.log(`File '${filePath}' uploaded successfully!`);
                console.log("API Response:", responseBody);
                return true;
            } else {
                console.error(`Failed to upload file '${filePath}'. Status: ${response.status}`);
                console.error("API Response:", responseBody);
                if (response.status === 504 && attempt < 3) {
                    console.log("Retrying...");
                } else {
                    return false;
                }
            }
        } catch (err) {
            console.error(`Error during upload: ${err}`);
            if (attempt < 3) console.log("Retrying...");
            else return false;
        }
    }
    return false;
}

// Delete file after successful upload
function deleteFile(filePath) {
    try {
        fs.unlinkSync(filePath);
        console.log(`Deleted file: ${filePath}`);
    } catch (err) {
        console.error(`Failed to delete file '${filePath}': ${err}`);
    }
}

// Upload all files in the folder
async function uploadAllFiles(folderPath, cookie) {
    const files = fs.readdirSync(folderPath)
        .map(file => path.join(folderPath, file))
        .filter(file => fs.statSync(file).isFile())
        .sort((a, b) => fs.statSync(a).size - fs.statSync(b).size);

    console.log(`Total files to upload: ${files.length}`);
    let uploadedCount = 0;

    for (const filePath of files) {
        if (await uploadFile(filePath, cookie)) {
            deleteFile(filePath);
            uploadedCount++;
        }
        console.log(`Progress: ${uploadedCount}/${files.length} files uploaded.`);
    }
}

// Main execution
const cookie = extractCookie(sessionFile);
if (cookie) {
    console.log("Cookie extracted successfully:", cookie);
    await uploadAllFiles(folderPath, cookie);
} else {
    console.error("Cookie not found in the session file.");
}
