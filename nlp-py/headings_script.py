import os
import shutil
from bs4 import BeautifulSoup
import sys

# Set UTF-8 encoding for output
sys.stdout.reconfigure(encoding='utf-8')

# Paths
source_folder = r'c:\users\owner\downloads\listing\pages'
destination_folder = r'c:\users\owner\downloads\listing\ipfs\temp'

# Create destination folder if it doesn't exist
os.makedirs(destination_folder, exist_ok=True)

# Function to clean and shorten the filename
def clean_filename(heading, max_length=100):
    # Remove invalid characters and replace them with underscores
    valid_filename = ''.join(c if c.isalnum() or c in (' ', '-', '_') else '_' for c in heading)
    valid_filename = valid_filename.strip()  # Remove leading/trailing spaces
    return valid_filename[:max_length]  # Truncate the filename to the max length

# Function to extract the heading from the HTML file
def extract_heading(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            soup = BeautifulSoup(f, 'html.parser')
    except UnicodeDecodeError:
        print(f"UTF-8 failed for {file_path}, trying ISO-8859-1.")
        try:
            with open(file_path, 'r', encoding='ISO-8859-1') as f:
                soup = BeautifulSoup(f, 'html.parser')
        except UnicodeDecodeError:
            print(f"Failed to decode {file_path}, skipping file.")
            return None
    
    # Try to find the first heading (h1, h2, h3, h4, h5, h6)
    for tag in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
        heading = soup.find(tag)
        if heading:
            return heading.get_text(strip=True)
    
    return 'untitled'

# Function to rename and move the file
def rename_and_move(file_path, destination_folder, heading, file_ext):
    if heading is None:
        return  # Skip the file if no valid heading was found
    
    # Clean the heading and limit its length
    clean_heading = clean_filename(heading)
    
    # Check if the file name already exists in the destination folder
    counter = 1
    new_file_name = f"{clean_heading}.{file_ext}"
    new_file_path = os.path.join(destination_folder, new_file_name)
    
    # If file with the same name exists, append a number to the name
    while os.path.exists(new_file_path):
        new_file_name = f"{clean_heading}_{counter}.{file_ext}"
        new_file_path = os.path.join(destination_folder, new_file_name)
        counter += 1
    
    # Move the file to the new destination with the new name
    try:
        shutil.move(file_path, new_file_path)
        print(f"Moved: {file_path} -> {new_file_path}")
    except OSError as e:
        print(f"Failed to move {file_path} -> {new_file_path}: {e}")

# Iterate through all HTML and HTM files in the source folder
for file_name in os.listdir(source_folder):
    if file_name.endswith(('.html', '.htm')):
        file_path = os.path.join(source_folder, file_name)
        file_ext = file_name.split('.')[-1]
        
        # Extract heading for the new file name
        heading = extract_heading(file_path)
        
        # Rename and move the file
        rename_and_move(file_path, destination_folder, heading, file_ext)

print("All files have been renamed and moved successfully.")
