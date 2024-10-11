import os
import sys
from PyPDF2 import PdfReader
import requests
import re

# Ensure the script uses UTF-8 for output
sys.stdout.reconfigure(encoding='utf-8')

# Define the folder path containing PDFs
folder_path = "c:/users/owner/downloads/listing/libgen"
log_file_path = "processed_files.txt"

# Function to extract the title, authors, and date from the PDF text
def extract_title_authors_and_date_from_pdf(pdf_path, max_pages=3):
    try:
        reader = PdfReader(pdf_path)
        text = ""
        
        # Extract text from the first few pages
        for page_num in range(min(max_pages, len(reader.pages))):
            page = reader.pages[page_num]
            text += page.extract_text()
        
        lines = text.splitlines()
        title = None
        authors = []

        # Extract title and authors (this logic can be adjusted as needed)
        for line in lines:
            line = line.strip()
            if len(line) > 20 and title is None:  # Assuming title is longer than 20 characters
                title = line
            elif line:  # Add potential author lines (this is a heuristic)
                authors.append(line)

        return title, authors
    except Exception as e:
        print(f"Error reading {pdf_path}: {e}")
        return None, None

# Function to search for DOI using Crossref API by title and authors
def search_doi_by_title_authors_and_date(title, authors, date=None):
    url = "https://api.crossref.org/works"
    author_query = " and ".join(authors[:3])  # Use first three authors for the query
    params = {
        'query.bibliographic': f"{title} {author_query}",
        'rows': 1  # Limit to one result
    }
    headers = {
        'User-Agent': 'YourApp/1.0 (mailto:your-email@example.com)'  # Add your email here
    }
    
    try:
        response = requests.get(url, headers=headers, params=params)
        data = response.json()
        
        if data['message']['items']:
            return data['message']['items'][0].get('DOI', 'DOI not found')
        return None
    except Exception as e:
        print(f"Error querying Crossref API: {e}")
        return None

# Function to sanitize title for use in filenames
def sanitize_filename(filename):
    return re.sub(r'[<>:"/\\|?*]', '', filename)  # Remove invalid characters for filenames

# Function to load processed files
def load_processed_files(log_file):
    if os.path.exists(log_file):
        with open(log_file, "r", encoding='utf-8') as f:
            return set(f.read().splitlines())  # Return a set of processed file names
    return set()

# Function to log processed files
def log_processed_file(log_file, filename):
    with open(log_file, "a", encoding='utf-8') as f:
        f.write(filename + "\n")

# Function to rename PDFs by their extracted DOI or title
def rename_pdf_by_doi_or_title(folder, log_file):
    processed_files = load_processed_files(log_file)

    for filename in os.listdir(folder):
        if filename.endswith(".pdf") and filename not in processed_files:
            file_path = os.path.join(folder, filename)
            title, authors = extract_title_authors_and_date_from_pdf(file_path)
            if title:
                print(f"Processing {filename} with title: {title} and authors: {authors}")
                doi = search_doi_by_title_authors_and_date(title, authors)
                
                if doi:
                    print(f"Found DOI for {filename}: {doi}")
                    new_filename = doi.replace("/", "_") + ".pdf"
                else:
                    print(f"DOI not found for {filename}, using title for renaming.")
                    sanitized_title = sanitize_filename(title[:100])  # Limit title to 100 characters
                    new_filename = sanitized_title + ".pdf"
                
                new_file_path = os.path.join(folder, new_filename)

                # If the new filename already exists, append a unique identifier
                counter = 1
                while os.path.exists(new_file_path):
                    new_filename = new_filename[:-4] + f"_{counter}.pdf"
                    new_file_path = os.path.join(folder, new_filename)
                    counter += 1

                os.rename(file_path, new_file_path)
                log_processed_file(log_file, filename)  # Log the successfully processed file
                print(f"Renamed {filename} to {new_filename}")
            else:
                print(f"Title not found for {filename}")

# Run the renaming function
rename_pdf_by_doi_or_title(folder_path, log_file_path)
