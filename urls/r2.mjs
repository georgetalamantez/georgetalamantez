import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import fetch from 'node-fetch';

const START_FILE = './urls.txt';
const OUTPUT_FILE = './output.txt';
const BATCH_SIZE = 10; // Number of URLs to process in each batch

// Base URL to restrict crawling
const BASE_URL = 'https://www.storj-ipfs.com';
const FILE_EXTENSIONS = ['.flac', '.mp3'];
const IGNORE_EXTENSIONS = ['.nfo', '.png', '.txt', '.m4a', '.cue', '.jpg', '.m3u'];

/**
 * Fetches the HTML content of a URL.
 * @param {string} url - The URL to fetch.
 * @returns {string|null} - The HTML content or null if the request fails.
 */
async function fetchPage(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch ${url}`);
    return await response.text();
  } catch (error) {
    console.error(`Error fetching ${url}:`, error.message);
    return null;
  }
}

/**
 * Finds URLs containing a specific keyword and optionally filters by file extensions.
 * @param {Object} $ - Cheerio instance of the loaded HTML.
 * @param {string} baseUrl - The base URL for resolving relative links.
 * @param {string} keyword - Keyword to search in URLs.
 * @param {Array<string>} extensions - Optional file extensions to filter URLs.
 * @param {Array<string>} ignoreExtensions - Extensions to ignore.
 * @returns {Array<string>} - Array of matching URLs.
 */
function findUrls($, baseUrl, keyword, extensions = [], ignoreExtensions = []) {
  const links = [];
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (href && href.includes(keyword) && 
        (extensions.length === 0 || extensions.some(ext => href.endsWith(ext))) &&
        !ignoreExtensions.some(ext => href.endsWith(ext))) {
      links.push(new URL(href, baseUrl).href);
    }
  });
  return links;
}

/**
 * Recursively crawls IPFS pages, collecting specified file types.
 * @param {string} startUrl - Starting URL.
 * @param {Set<string>} visited - Tracks visited URLs.
 * @param {Set<string>} results - Collects matching file URLs.
 */
async function crawlIpfs(startUrl, visited, results) {
  const toVisit = [startUrl];

  while (toVisit.length > 0) {
    const currentUrl = toVisit.shift();
    if (visited.has(currentUrl)) continue;

    console.log(`Visiting: ${currentUrl}`);
    visited.add(currentUrl);

    const html = await fetchPage(currentUrl);
    if (!html) continue;

    const $ = cheerio.load(html);

    // Collect URLs with specified file extensions, ignoring certain extensions
    const matchingLinks = findUrls($, currentUrl, '?filename=', FILE_EXTENSIONS, IGNORE_EXTENSIONS);
    for (const link of matchingLinks) {
      if (!results.has(link)) {
        console.log(`Collected: ${link}`);
        results.add(link);
      }
    }

    // Find and queue pages with ?filename= (without filtering by file extensions), ignoring certain extensions
    const subPages = findUrls($, currentUrl, '?filename=', [], IGNORE_EXTENSIONS).filter(url => 
      !FILE_EXTENSIONS.some(ext => url.endsWith(ext))
    );
    toVisit.push(...subPages.filter(url => !visited.has(url)));
  }
}

(async () => {
  try {
    const startUrls = (await fs.readFile(START_FILE, 'utf-8')).split('\n').filter(Boolean);
    const visited = new Set();
    const results = new Set();

    for (let i = 0; i < startUrls.length; i += BATCH_SIZE) {
      const batch = startUrls.slice(i, i + BATCH_SIZE);
      for (const startUrl of batch) {
        console.log(`Starting crawl from: ${startUrl}`);
        await crawlIpfs(startUrl, visited, results);
      }
    }

    console.log(`\nCollected ${results.size} links:`);
    await fs.writeFile(OUTPUT_FILE, [...results].join('\n'), 'utf-8');
    console.log(`Results saved to ${OUTPUT_FILE}`);
  } catch (error) {
    console.error('An error occurred:', error.message);
  }
})();
