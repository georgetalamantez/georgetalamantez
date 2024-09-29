import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

// Base URL to prepend to relative .flac URLs
const BASE_URL = 'https://www.storj-ipfs.com';

// Function to fetch a webpage and extract .flac URLs
async function extractFlacUrls(pageUrl) {
  try {
    // Fetch the webpage content
    const response = await fetch(pageUrl);
    const html = await response.text();
    
    // Parse the HTML using jsdom
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Get all anchor tags and filter out URLs that end with .flac
    const flacUrls = Array.from(document.querySelectorAll('a'))
      .map(a => a.href)
      .filter(href => href.includes('.flac'))
      .map(href => formatFlacUrl(href));

    return flacUrls;
  } catch (error) {
    console.error(`Error fetching or processing the page: ${error}`);
  }
}

// Function to format .flac URLs
function formatFlacUrl(url) {
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

// Example usage
const pageUrl = 'https://www.example.com'; // Replace with your target page URL
extractFlacUrls(pageUrl).then(flacUrls => {
  // Log each URL on a new line without surrounding quotes and commas
  flacUrls.forEach(url => {
    console.log(url);
  });
});
