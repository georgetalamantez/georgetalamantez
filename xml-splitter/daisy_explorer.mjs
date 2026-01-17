import fs from 'fs';
import * as cheerio from 'cheerio';

/**
 * DAISY Explorer - A tool for navigating complex DTBook XML structures.
 * 
 * DAISY books use hierarchical "levels" (level1, level2, ...) 
 * instead of just flat headings. This script demonstrates how to 
 * extract these meaningful structural blocks.
 */

const filePath = 'C:/Users/Owner/Documents/GitHub/georgetalamantez/books/2.html';

async function exploreDaisy() {
    try {
        const content = fs.readFileSync(filePath, 'utf8');

        // Use xmlMode: true to preserve the case of tags (like level1, level2)
        const $ = cheerio.load(content, { xmlMode: true });

        console.log('--- BOOK METADATA ---');
        console.log('Title:', $('dc\\:Title').text() || $('doctitle').first().text());
        console.log('Creator:', $('dc\\:Creator').text() || $('docauthor').first().text());
        console.log('Identifier:', $('dc\\:Identifier').text());
        console.log('---------------------\n');

        // Extracting chapters (usually level1)
        console.log('--- CHAPTER LIST (level1 blocks) ---');
        $('level1').each((i, el) => {
            const id = $(el).attr('id');
            const heading = $(el).find('h1, h2, h3').first().text().trim();
            const childLevels = $(el).children('level2').length;

            console.log(`[Level1] ID: ${id} | Heading: "${heading.substring(0, 50)}..." | Sub-levels: ${childLevels}`);
        });

        // Example: Extract content of a specific chapter
        const targetId = 'ch09'; // Chapter 1 in your file
        const chapter = $(`#${targetId}`);

        if (chapter.length) {
            console.log(`\n--- EXTRACTING CHAPTER CONTENT (${targetId}) ---`);
            const title = chapter.find('h1').text().trim();
            const wordCount = chapter.text().split(/\s+/).length;

            console.log(`Title: ${title}`);
            console.log(`Approx. Word Count: ${wordCount}`);

            // You could save this specific chapter to a new file easily:
            // fs.writeFileSync(`${targetId}.xml`, chapter.html());
        }

    } catch (error) {
        console.error('Error exploring DAISY file:', error);
    }
}

exploreDaisy();
