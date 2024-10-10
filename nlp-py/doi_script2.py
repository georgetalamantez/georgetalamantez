import os
import re
from PyPDF2 import PdfReader

# Define the folder path containing PDFs
folder_path = "c:/users/owner/downloads/listing/libgen"

# Define a regex pattern for DOI (matching both doi.org and dx.doi.org URLs)
doi_pattern = r"https?://(?:dx\.)?doi\.org/(10\.\d{4,9}/[-._;()/:A-Z0-9]+)"

# Function to extract DOI from the first few pages of the PDF
def extract_doi_from_pdf(pdf_path, max_pages=3):
    try:
        # Open the PDF file
        reader = PdfReader(pdf_path)
        
        # Check metadata for DOI first (not always present)
        if "/doi" in reader.metadata:
            return reader.metadata["/doi"]

        text = ""
        # Extract text from the first few pages
        for page_num in range(min(max_pages, len(reader.pages))):
            page = reader.pages[page_num]
            text += page.extract_text()

        # Search for DOI URLs in the extracted text
        doi_match = re.search(doi_pattern, text, re.IGNORECASE)
        if doi_match:
            return doi_match.group(1)  # Return the matched DOI from the URL
        return None
    except Exception as e:
        print(f"Error reading {pdf_path}: {e}")
        return None

# Function to rename PDFs by their extracted DOI
def rename_pdf_by_doi(folder):
    for filename in os.listdir(folder):
        if filename.endswith(".pdf"):
            file_path = os.path.join(folder, filename)
            doi = extract_doi_from_pdf(file_path)
            if doi:
                # Replace slashes with underscores to avoid filename issues
                new_filename = doi.replace("/", "_") + ".pdf"
                new_file_path = os.path.join(folder, new_filename)
                os.rename(file_path, new_file_path)
                print(f"Renamed {filename} to {new_filename}")
            else:
                print(f"DOI not found for {filename}")

# Run the renaming function
rename_pdf_by_doi(folder_path)
