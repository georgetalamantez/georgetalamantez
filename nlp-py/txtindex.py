import os
import shutil
import json

# Paths
index_file = r"./index.json"
source_folder = r"c:\users\owner\downloads\listing\pages"
destination_folder = r"c:\users\owner\downloads\listing\500html"

# Ensure the destination folder exists
os.makedirs(destination_folder, exist_ok=True)

# Load the index.json
with open(index_file, 'r', encoding='utf-8') as f:
    index = json.load(f)

# Move files containing the keyword 'javascript'
moved_files_count = 0
total_files = len(index)
processed_files_count = 0

for filename, metadata in index.items():
    processed_files_count += 1
    print(f"Processing {processed_files_count} of {total_files}: {filename}")
    
    # Check if the file has the keyword "javascript"
    if any("javascript" in str(value).lower() for value in metadata.values()):
        source_path = os.path.join(source_folder, filename)
        destination_path = os.path.join(destination_folder, filename)

        # Move the file if it exists in the source folder
        if os.path.exists(source_path):
            shutil.move(source_path, destination_path)
            print(f"Moved: {filename}")
            moved_files_count += 1
        else:
            print(f"File not found, skipping: {filename}")

print(f"Total files moved: {moved_files_count}")
