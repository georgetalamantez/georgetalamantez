import os
from bs4 import BeautifulSoup

# Define the directory path
dir_path = r'c:/users/owner/downloads/listing/pages'

# Keywords to search for in headings
keywords = ['abstract', 'introduction', 'references']

# Function to check if any heading contains the keywords
def contains_keyword_in_heading(file_path):
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as file:
        # Use 'lxml' parser with 'features="xml"' to handle XML-based HTML
        soup = BeautifulSoup(file, features="lxml-xml")
        headings = soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])

        # Check if any heading contains the keywords
        for heading in headings:
            if any(keyword in heading.get_text().lower() for keyword in keywords):
                return True
    return False

# Function to delete files if the heading contains any keyword
def delete_files_by_heading():
    deleted_files_count = 0
    total_files_count = 0

    for file_name in os.listdir(dir_path):
        if file_name.endswith('.htm') or file_name.endswith('.html'):
            file_path = os.path.join(dir_path, file_name)
            total_files_count += 1

            print(f'Processing file: {file_path}')

            try:
                if contains_keyword_in_heading(file_path):
                    os.remove(file_path)
                    deleted_files_count += 1
                    print(f'Deleted file: {file_path}')
                else:
                    print(f'No matching headings found, skipping file: {file_path}')
            except Exception as e:
                print(f'Error processing file: {file_path}, {e}')

    print(f'Total files processed: {total_files_count}')
    print(f'Total files deleted: {deleted_files_count}')

# Execute the file deletion process
if __name__ == '__main__':
    delete_files_by_heading()
