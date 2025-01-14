import os
import shutil
from bs4 import BeautifulSoup
import sys
import chardet

# Set UTF-8 encoding for output
sys.stdout.reconfigure(encoding='utf-8')

# Paths
source_folder = r'c:\users\owner\downloads\listing\html'
destination_folder = r'c:\users\owner\downloads\listing\ipfs\temp'

# Create destination folder if it doesn't exist
os.makedirs(destination_folder, exist_ok=True)

# Function to clean and shorten the filename, removing numbers and periods
def clean_filename(heading, max_length=100):
    valid_filename = ''.join(c if c.isalpha() or c in (' ', '-', '_') else '_' for c in heading)
    return valid_filename[:max_length].strip()

# Function to detect file encoding
def detect_encoding(file_path):
    with open(file_path, 'rb') as f:
        result = chardet.detect(f.read())
    return result['encoding']

# Function to extract the heading from the HTML file with fallback encodings
def extract_heading(file_path):
    # Detect initial encoding
    encoding = detect_encoding(file_path)
    print(f"Detected encoding for {file_path}: {encoding}")

    # Fallback encodings to try if detected encoding fails
    fallback_encodings = [encoding, 'utf-8', 'ISO-8859-1', 'windows-1252']

    for enc in fallback_encodings:
        try:
            with open(file_path, 'r', encoding=enc) as f:
                soup = BeautifulSoup(f, 'lxml')  # Use lxml parser
            print(f"Successfully decoded {file_path} with encoding {enc}")
            # Find the first heading
            for tag in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
                heading = soup.find(tag)
                if heading:
                    return heading.get_text(strip=True)
            return 'untitled'
        except (UnicodeDecodeError, TypeError):
            print(f"Failed to decode {file_path} with encoding {enc}, trying next fallback.")
    
    print(f"All decoding attempts failed for {file_path}, skipping file.")
    return None

# Function to rename and move the file
def rename_and_move(file_path, destination_folder, heading, file_ext):
    if heading is None:
        return

    clean_heading = clean_filename(heading)
    counter = 1
    new_file_name = f"{clean_heading}.{file_ext}"
    new_file_path = os.path.join(destination_folder, new_file_name)

    while os.path.exists(new_file_path):
        new_file_name = f"{clean_heading}_{counter}.{file_ext}"
        new_file_path = os.path.join(destination_folder, new_file_name)
        counter += 1

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
        
        heading = extract_heading(file_path)
        
        rename_and_move(file_path, destination_folder, heading, file_ext)

print("All files have been renamed and moved successfully.")
