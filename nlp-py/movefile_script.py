import os
import shutil

# Define source and destination directories
source_dir = r"C:\users\owner\downloads\listing\ipfs\temp"
destination_dir = r"C:\users\owner\downloads\listing\torrents"

# Create destination directory if it doesn't exist
if not os.path.exists(destination_dir):
    os.makedirs(destination_dir)

# Loop through files in the source directory
for filename in os.listdir(source_dir):
    # Check if 'conclusion' is in the filename
    if 'literature review' in filename.lower():
        # Construct full file paths
        source_file = os.path.join(source_dir, filename)
        destination_file = os.path.join(destination_dir, filename)
        
        # Move the file
        shutil.move(source_file, destination_file)
        print(f"Moved: {filename}")

print("File move process completed.")
