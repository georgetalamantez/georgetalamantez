import os
import shutil

# Define the main directory
main_folder = r"c:\users\owner\downloads\listing\html"

# Walk through each subfolder and move files to the main folder
for root, dirs, files in os.walk(main_folder):
    # Skip the main folder itself
    if root == main_folder:
        continue

    for file in files:
        source_path = os.path.join(root, file)
        destination_path = os.path.join(main_folder, file)

        # Move file only if it doesn't already exist in the main folder
        if not os.path.exists(destination_path):
            shutil.move(source_path, destination_path)
            print(f"Moved: {source_path} -> {destination_path}")
        else:
            print(f"Skipped (already exists): {destination_path}")

print("File moving process complete.")
