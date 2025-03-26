import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const folderPath = "G:\\My Drive\\email it in";
const outputDir = "G:\\My Drive\\torrents";

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

async function extractAndDownloadFiles() {
    // Filter .html files containing 'torrentgalaxy' in the filename
    const files = fs.readdirSync(folderPath).filter(file =>
        file.endsWith('.html') && file.toLowerCase().includes('torrentgalaxy')
    );

    for (const file of files) {
        const filePath = path.join(folderPath, file);
        const htmlContent = fs.readFileSync(filePath, 'utf8');

        const $ = cheerio.load(htmlContent);
        const downloadLinks = [];

        // Find all valid download links and their corresponding text
        $("a").each((_, element) => {
            const href = $(element).attr("href");
            const linkText = $(element).text().trim(); // Extracts text inside <a>...</a>

            if (href && href.includes("watercache.nanobytes.org/get/") && linkText) {
                downloadLinks.push({ url: href, filename: linkText });
            }
        });

        console.log(`Found ${downloadLinks.length} download links in ${file}`);

        for (const { url, filename } of downloadLinks) {
            // Sanitize filename (remove invalid characters)
            const safeFilename = filename.replace(/[<>:"\/\\|?*]+/g, "").trim() + ".torrent";
            const outputPath = path.join(outputDir, safeFilename);

            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`Failed to download: ${url}`);

                const buffer = await response.buffer();
                fs.writeFileSync(outputPath, buffer);

                console.log(`Downloaded: ${safeFilename}`);
            } catch (error) {
                console.error(`Error downloading ${url}:`, error);
            }
        }
    }
}

extractAndDownloadFiles();
