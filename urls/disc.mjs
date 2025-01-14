import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

// Base URL to prepend to relative URLs
const BASE_URL = 'https://www.storj-ipfs.com';

// Function to fetch a webpage and extract .flac and .mp3 URLs
async function extractAudioUrls(pageUrl) {
  try {
    // Fetch the webpage content
    const response = await fetch(pageUrl);
    const html = await response.text();

    // Parse the HTML using jsdom
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Get all anchor tags and filter out URLs that end with .flac or .mp3
    const audioUrls = Array.from(document.querySelectorAll('a'))
      .map(a => a.href)
      .filter(href => href.match(/\.(flac|mp3)$/i)) // Match .flac or .mp3 (case-insensitive)
      .map(href => formatAudioUrl(href));

    return audioUrls;
  } catch (error) {
    console.error(`Error fetching or processing the page: ${error}`);
    return []; // Return an empty array in case of error
  }
}

// Function to format audio URLs
function formatAudioUrl(url) {
  let formattedUrl = url;

  // If the URL starts with /ipfs, prepend the base URL
  if (url.startsWith('/ipfs')) {
    formattedUrl = `${BASE_URL}${url}`;
  }

  // Remove the query parameters (everything after "?")
  formattedUrl = formattedUrl.split('?')[0];

  // Decode the URL encoding (to handle characters like %20 for space)
  formattedUrl = decodeURIComponent(formattedUrl);

  return formattedUrl;
}

// Main function to read URLs from a .txt file and process each URL
async function processUrlsFromFile(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    const urls = data.split('\n').filter(line => line.trim() !== '');

    for (const url of urls) {
      const audioUrls = await extractAudioUrls(url);

      audioUrls.forEach(audioUrl => {
        console.log(audioUrl);
      });
    }
  } catch (error) {
    console.error(`Error reading URLs from file: ${error}`);
  }
}

// Replace with the path to your .txt file containing URLs
const filePath = path.resolve('urls.txt');
processUrlsFromFile(filePath);
