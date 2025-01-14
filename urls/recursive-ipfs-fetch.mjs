import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import fetch from 'node-fetch';

const START_FILE = './urls.txt';
const OUTPUT_FILE = './output.txt';

// Base URL to restrict crawling
const BASE_URL = 'https://www.storj-ipfs.com';

/**
 * Recursively fetches URLs ending with .flac or .mp3.
 * @param {string} url - URL to start fetching from.
 * @param {Set<string>} visited - Tracks visited URLs to prevent re-fetching.
 * @param {Array<string>} result - Accumulates matching URLs.
 */
async function fetchRecursive(url, visited, result) {
  if (visited.has(url)) return;
  visited.add(url);

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch ${url}`);
    const html = await response.text();
    const $ = cheerio.load(html);

    // Find and save .flac or .mp3 URLs
    $('a[href]').each((_, el) => {
      const link = $(el).attr('href');
      const absoluteUrl = new URL(link, url).toString();

      if (absoluteUrl.startsWith(BASE_URL) && (link.endsWith('.flac') || link.endsWith('.mp3'))) {
        result.push(absoluteUrl);
      }
    });

    // Find directories or other links to explore within the BASE_URL
    const nextLinks = $('a[href]')
      .map((_, el) => $(el).attr('href'))
      .get()
      .map(link => new URL(link, url).toString())
      .filter(link => link.startsWith(BASE_URL) && !link.endsWith('.flac') && !link.endsWith('.mp3'));

    // Recursive calls for nested directories/pages
    for (const nextLink of nextLinks) {
      await fetchRecursive(nextLink, visited, result);
    }
  } catch (err) {
    console.error(`Error processing ${url}: ${err.message}`);
  }
}

(async () => {
  const visited = new Set();
  const result = [];

  try {
    // Read URLs from input file
    const urls = (await fs.readFile(START_FILE, 'utf-8')).split('\n').filter(Boolean);

    // Process each root URL
    for (const url of urls) {
      console.log(`Processing: ${url}`);
      await fetchRecursive(url, visited, result);
    }

    // Write results to output file
    await fs.writeFile(OUTPUT_FILE, result.join('\n'), 'utf-8');
    console.log(`Completed! Found ${result.length} matching URLs.`);
  } catch (err) {
    console.error(`Script failed: ${err.message}`);
  }
})();
