import { exec } from "child_process";
import { readdir, appendFile } from "fs/promises";
import { join } from "path";

const folderPath = "C:/libgen";
const outputFile = join(folderPath, "cids.txt");

async function uploadFiles() {
    try {
        const files = await readdir(folderPath);
        for (const file of files) {
            const filePath = join(folderPath, file);
            console.log(`Uploading: ${filePath}`);

            await new Promise((resolve, reject) => {
                exec(`btfs add --to-blockchain "${filePath}"`, async (error, stdout) => {
                    if (error) {
                        console.error(`Error uploading ${file}: ${error.message}`);
                        reject(error);
                        return;
                    }

                    const cid = stdout.trim();
                    console.log(`Uploaded: ${file} -> CID: ${cid}`);
                    await appendFile(outputFile, `${file}: ${cid}\n`);
                    resolve();
                });
            });
        }
        console.log("Upload complete. CIDs saved to cids.txt.");
    } catch (err) {
        console.error("Error:", err);
    }
}

uploadFiles();
