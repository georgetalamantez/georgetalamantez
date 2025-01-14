import os
import shutil

# Paths
source_folder = r'c:\users\owner\downloads\listing\pages'
destination_folder = r'c:\users\owner\downloads\listing\500html'

# Get a list of all .txt files in the source folder with their sizes
files_with_size = [
    (file, os.path.getsize(os.path.join(source_folder, file)))
    for file in os.listdir(source_folder)
    if file.endswith('.txt')
]

# Sort files by size in descending order
files_with_size.sort(key=lambda x: x[1], reverse=True)

# Move the largest 1000 files
for i, (file, size) in enumerate(files_with_size[:1000]):
    source_path = os.path.join(source_folder, file)
    destination_path = os.path.join(destination_folder, file)
    
    # Move the file
    shutil.move(source_path, destination_path)
    print(f'Moved file {i + 1}: {file} (Size: {size} bytes)')

print("Completed moving 1000 files.")
