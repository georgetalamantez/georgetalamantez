import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs-extra';

const RSS_FEED_URL = 'https://btdig.com/rss.xml';
const DOWNLOADED_FILE = 'downloaded.json';

async function fetchTorrentMetadata(hash, filename) {
    try {
        // Create the URL for the .torrent file
        const torrentUrl = `https://hash2torrent.com/torrents/${hash}`;
        console.log(`✅ Fetching torrent file for ${filename}...`);

        // Fetch the torrent file
        const { data } = await axios.get(torrentUrl, { responseType: 'arraybuffer' });

        // Save the .torrent file
        await fs.writeFile(filename, data);
        console.log(`✅ Successfully saved torrent file: ${filename}`);
    } catch (error) {
        console.error(`⚠️ Failed to fetch or save torrent for ${filename}:`, error.message);
    }
}

async function extractTorrents() {
    try {
        console.log("Fetching RSS feed...");
        const { data } = await axios.get(RSS_FEED_URL);

        const $ = cheerio.load(data, { xmlMode: true });
        let torrents = [];

        let downloaded = [];
        if (fs.existsSync(DOWNLOADED_FILE)) {
            downloaded = fs.readJsonSync(DOWNLOADED_FILE);
        }

        for (const element of $('item').toArray()) {
            const title = $(element).find('title').text().trim();
            const link = $(element).find('link').text().trim();

            if (link && title) {
                const hash = link.split('/').pop();
                const safeFilename = title.replace(/[<>:"/\\|?*]+/g, "") + ".torrent";

                if (!downloaded.includes(safeFilename)) {
                    torrents.push({ hash, filename: safeFilename });
                }
            }
        }

        if (torrents.length > 0) {
            console.log(`✅ Found ${torrents.length} new torrents.`);

            for (const { hash, filename } of torrents) {
                try {
                    await fetchTorrentMetadata(hash, filename);
                    downloaded.push(filename);
                } catch (error) {
                    console.warn(`⚠️ Failed to fetch torrent for ${filename}:`, error.message);
                }
            }

            fs.writeJsonSync(DOWNLOADED_FILE, downloaded, { spaces: 2 });
        } else {
            console.log("⚠️ No new torrents to download.");
        }
    } catch (error) {
        console.error("❌ Error extracting torrents:", error);
        process.exit(1);
    }
}

extractTorrents();
