import os
import re
import sys
import shutil

# Force UTF-8 encoding for print output
sys.stdout.reconfigure(encoding='utf-8')

# Folder paths
source_folder = r"c:\users\owner\downloads\listing\500html"
destination_folder = r"c:\users\owner\downloads\listing\500html"

# Ensure destination folder exists
os.makedirs(destination_folder, exist_ok=True)

# Function to create a unique filename if a duplicate exists
def get_unique_filename(directory, filename):
    count = 1
    original_filename = filename
    while os.path.exists(os.path.join(directory, filename + ".txt")):
        filename = f"{original_filename}_{count}"
        count += 1
    return filename

# Function to clean a line by removing numbers, punctuation, and invalid characters
def clean_text_line(line):
    # Remove numbers and punctuation, keep letters and spaces
    cleaned_line = re.sub(r'[^a-zA-Z\s]', '', line)
    # Remove extra whitespace and limit filename length
    cleaned_line = re.sub(r'\s+', ' ', cleaned_line).strip()
    # Remove any characters invalid in Windows filenames
    cleaned_line = re.sub(r'[\\/*?:"<>|]', '', cleaned_line)
    return cleaned_line

# Loop through each .txt file in the source folder
for filename in os.listdir(source_folder):
    if filename.endswith(".txt"):
        file_path = os.path.join(source_folder, filename)

        first_text_line = ""
        
        # Try reading the file with UTF-8, fallback to ISO-8859-1 if necessary
        try:
            with open(file_path, "r", encoding="utf-8") as file:
                for line in file:
                    # Check if line contains at least one alphabetical character
                    if re.search(r'[a-zA-Z]', line):
                        first_text_line = line.strip()
                        break
        except UnicodeDecodeError:
            with open(file_path, "r", encoding="ISO-8859-1") as file:
                for line in file:
                    if re.search(r'[a-zA-Z]', line):
                        first_text_line = line.strip()
                        break

        # Log the raw extracted line for debugging, handling encoding errors
        print(f"Extracted line from '{filename}': '{first_text_line}'")

        # Clean the first line of text and prepare the new filename
        cleaned_text_line = clean_text_line(first_text_line)[:50]  # Limit to 50 characters

        # Use a default filename if the cleaned text line is empty
        if not cleaned_text_line:
            cleaned_text_line = "default_filename"
            print(f"Warning: No usable text in '{filename}', default name assigned.")
        else:
            print(f"Cleaned filename from '{filename}': '{cleaned_text_line}'")

        new_filename = get_unique_filename(destination_folder, cleaned_text_line)

        # Rename the file in the source folder
        new_file_path = os.path.join(source_folder, new_filename + ".txt")
        os.rename(file_path, new_file_path)
        print(f"Renamed '{filename}' to '{new_filename}.txt'")

        # Move the renamed file to the destination folder
        final_destination_path = os.path.join(destination_folder, new_filename + ".txt")
        shutil.move(new_file_path, final_destination_path)
        print(f"Moved '{new_filename}.txt' to '{destination_folder}'")
