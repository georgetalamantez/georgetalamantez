import os
import shutil

# Source and destination folders
source_folder = r'c:\users\owner\downloads\listing\ipfs\temp'
destination_folder = r'c:\users\owner\downloads\listing\ipfs\torrents'

# Ensure destination folder exists
os.makedirs(destination_folder, exist_ok=True)

# Loop through files in the source folder
for filename in os.listdir(source_folder):
    if 'literature review' in filename.lower():  # Check if 'related work' is in the filename
        source_path = os.path.join(source_folder, filename)
        destination_path = os.path.join(destination_folder, filename)

        # Move file
        shutil.move(source_path, destination_path)
        print(f"Moved: {filename}")

print("File transfer complete.")
