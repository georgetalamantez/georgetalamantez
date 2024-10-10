import os
import sys
from PyPDF2 import PdfReader
import requests

# Configure the output to handle UTF-8 encoding in Windows terminal
sys.stdout.reconfigure(encoding='utf-8')

# Define the folder path containing PDFs
folder_path = "c:/users/owner/downloads/listing/libgen"

# Function to extract the title, authors, and publication date from the PDF text
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
        date = None

        # Extract title, authors, and date (this logic can be adjusted as needed)
        for line in lines:
            line = line.strip()
            if len(line) > 20 and title is None:  # Assuming title is longer than 20 characters
                title = line
            elif line:  # Add potential author lines (this is a heuristic)
                authors.append(line)
            if "20" in line and len(line) <= 10:  # Heuristic for identifying the publication year (e.g., 2020)
                date = line  # Assuming the date is in a recognizable format

        return title, authors, date
    except Exception as e:
        print(f"Error reading {pdf_path}: {e}")
        return None, None, None

# Function to search for DOI using Crossref API by title, authors, and publication date
def search_doi_by_title_authors_and_date(title, authors, date):
    url = "https://api.crossref.org/works"
    # Format the author list for the query
    author_query = " and ".join(authors[:3])  # Use first three authors for the query
    params = {
        'query.bibliographic': f"{title} {author_query}",
        'rows': 1,  # Limit to one result
        'filter': f'from-pub-date:{date}' if date else None  # Filter by publication date if available
    }
    headers = {
        'User-Agent': 'YourApp/1.0 (mailto:jrt33415@gmail.com)'  # Add your email here
    }
    
    try:
        response = requests.get(url, headers=headers, params=params)
        data = response.json()

        # Check if the response contains expected keys
        if 'message' in data and 'items' in data['message'] and len(data['message']['items']) > 0:
            return data['message']['items'][0].get('DOI', 'DOI not found')
        else:
            print(f"No DOI found in the API response for title: {title}")
        return None
    except Exception as e:
        print(f"Error querying Crossref API: {e}")
        return None

# Function to rename PDFs by their extracted DOI, appending a unique identifier if the file exists
def rename_pdf_by_doi(folder):
    for filename in os.listdir(folder):
        if filename.endswith(".pdf"):
            file_path = os.path.join(folder, filename)
            title, authors, date = extract_title_authors_and_date_from_pdf(file_path)
            if title:
                doi = search_doi_by_title_authors_and_date(title, authors, date)
                if doi:
                    # Replace slashes with underscores to avoid filename issues
                    new_filename = doi.replace("/", "_") + ".pdf"
                    new_file_path = os.path.join(folder, new_filename)

                    # If the new filename already exists, append a unique identifier
                    counter = 1
                    while os.path.exists(new_file_path):
                        new_filename = doi.replace("/", "_") + f"_{counter}.pdf"
                        new_file_path = os.path.join(folder, new_filename)
                        counter += 1

                    os.rename(file_path, new_file_path)
                    print(f"Renamed {filename} to {new_filename}")
                else:
                    print(f"DOI not found for {filename} with title: {title}")
            else:
                print(f"Title not found for {filename}")

# Run the renaming function
rename_pdf_by_doi(folder_path)
