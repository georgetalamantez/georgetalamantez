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

// URLs to process
const pageUrls = [
  'https://www.example.com.com/ipfs/QmfXfdRxup1rL1vgojDQA1br2d5LcVY8uDg9Uzx98L71PT?filename=VA%2520-%2520New%2520Music%2520Releases%2520Week%252012%2520of%25202024%2520%2528FLAC%2520Songs%2529%2520%255BPMEDIA%255D%2520%25E2%25AD%2590%25EF%25B8%258F',
  'https://www.example.com.com/ipfs/QmVSyU63Ej98vXoYwvczZ7LHMZFz3RfJ2eD6M3ZG2BYMFp?filename=VA%2520-%2520New%2520Music%2520Releases%2520Week%252016%2520of%25202024%2520%2528FLAC%2520Songs%2529%2520%255BPMEDIA%255D%2520%25E2%25AD%2590%25EF%25B8%258F',
  'https://www.example.com.com/ipfs/QmWD77tSR6CnZ7RcANfs71D1FDtKhJpRHWYjdY9q2WMdB7?filename=VA%2520-%2520New%2520Music%2520Releases%2520Week%252026%2520of%25202024%2520%2528FLAC%2520Songs%2529%2520%255BPMEDIA%255D%2520%25E2%25AD%2590%25EF%25B8%258F',
  'https://www.example.com.com/ipfs/QmURKrx1t2wpgsDfARNvPGEaPvBHbUnLAZihDttEbDD9dA?filename=VA%2520-%2520New%2520Music%2520Releases%2520Week%252027%2520of%25202024%2520%2528FLAC%2520Songs%2529%2520%255BPMEDIA%255D%2520%25E2%25AD%2590%25EF%25B8%258F',
  'https://www.example.com.com/ipfs/QmZY9fihMpHb5ntcxMikSbDwGQBperKhmCqNbnygGi2Jbo?filename=VA%2520-%2520New%2520Music%2520Releases%2520Week%252031%2520of%25202024%2520%2528FLAC%2520Songs%2529%2520%255BPMEDIA%255D%2520%25E2%25AD%2590%25EF%25B8%258F',
  'https://www.example.com.com/ipfs/QmNPUesvjfT42bpuKLD5Ev4kBXYiUdJquPpZnQQukNMQbU?filename=VA%2520-%2520New%2520Music%2520Releases%2520Week%252034%2520of%25202024%2520%2528FLAC%2520Songs%2529%2520%255BPMEDIA%255D%2520%25E2%25AD%2590%25EF%25B8%258F',
  'https://www.example.com.com/ipfs/QmUsmghLo4btFmNafYGcXJx13oe6CXwNunb4F4BUV7PyVQ?filename=VA%2520-%2520New%2520Music%2520Releases%2520Week%252035%2520of%25202024%2520%2528FLAC%2520Songs%2529%2520%255BPMEDIA%255D%2520%25E2%25AD%2590%25EF%25B8%258F',
  'https://www.example.com.com/ipfs/QmXLKj387gvGQcf8w3shbzw7CmtimiNGhAgHNkU7QN3iXq?filename=VA%2520-%2520New%2520Music%2520Releases%2520Week%252036%2520of%25202024%2520%2528FLAC%2520Songs%2529%2520%255BPMEDIA%255D%2520%25E2%25AD%2590%25EF%25B8%258F',
  'https://www.example.com.com/ipfs/QmayYxnkJp5EpDgbATHMxHD2iazHgf1fKGtj5gzZHtA3xU?filename=VA%2520-%2520New%2520Music%2520Releases%2520Week%252037%2520of%25202024%2520%2528FLAC%2520Songs%2529%2520%255BPMEDIA%255D%2520%25E2%25AD%2590%25EF%25B8%258F',
  'https://www.example.com.com/ipfs/QmbL9NTLGNqortDUgfjJaAaYeAGb8k3kLfazCXV4dZamyV?filename=VA%2520-%2520New%2520Music%2520Releases%2520Week%252038%2520of%25202024%2520%2528FLAC%2520Songs%2529%2520%255BPMEDIA%255D%2520%25E2%25AD%2590%25EF%25B8%258F'
];

// Process each URL
(async () => {
  for (const pageUrl of pageUrls) {
    const flacUrls = await extractFlacUrls(pageUrl);
    if (flacUrls) {
      // Log each extracted URL on a new line
      flacUrls.forEach(url => {
        console.log(url);
      });
    }
  }
})();
