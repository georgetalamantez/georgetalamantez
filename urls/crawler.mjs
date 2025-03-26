import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs-extra';
import WebTorrent from 'webtorrent';

const RSS_FEED_URL = 'https://btdig.com/rss.xml';
const DOWNLOADED_FILE = 'downloaded.json';
const client = new WebTorrent();

async function fetchTorrentMetadata(magnet, filename) {
    return new Promise((resolve, reject) => {
        client.add(magnet, { announce: [] }, torrent => {
            console.log(`✅ Metadata fetched for ${filename}`);

            // Get the valid .torrent file
            const torrentBuffer = torrent.torrentFile;

            // Save the .torrent file
            fs.writeFile(filename, torrentBuffer)
                .then(() => resolve())
                .catch(err => reject(err));
        });

        setTimeout(() => reject(new Error(`Timeout fetching ${filename}`)), 60000);
    });
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
                const magnet = `magnet:?xt=urn:btih:${hash}`;
                const safeFilename = title.replace(/[<>:"/\\|?*]+/g, "") + ".torrent";

                if (!downloaded.includes(safeFilename)) {
                    torrents.push({ magnet, filename: safeFilename });
                }
            }
        }

        if (torrents.length > 0) {
            console.log(`✅ Found ${torrents.length} new torrents.`);

            for (const { magnet, filename } of torrents) {
                try {
                    console.log(`Fetching metadata for ${filename}...`);
                    await fetchTorrentMetadata(magnet, filename);
                    downloaded.push(filename);
                } catch (error) {
                    console.warn(`⚠️ Failed to fetch metadata for ${filename}:`, error.message);
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
