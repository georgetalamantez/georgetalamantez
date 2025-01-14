import os
import shutil

# Define source and destination directories
source_dir = r"c:\users\owner\downloads\listing\pages"
destination_dir = r"c:\users\owner\downloads\listing\500html"

# Ensure the destination directory exists
os.makedirs(destination_dir, exist_ok=True)

# Counter to track the number of files moved
files_moved = 0
max_files = 10000

# Iterate through the files in the source directory
for filename in os.listdir(source_dir):
    if filename.endswith(".txt"):
        source_file = os.path.join(source_dir, filename)
        destination_file = os.path.join(destination_dir, filename)
        
        # Move the file
        shutil.move(source_file, destination_file)
        files_moved += 1

        # Stop once we've moved 10,000 files
        if files_moved >= max_files:
            break

print(f"Moved {files_moved} .txt files to {destination_dir}")
