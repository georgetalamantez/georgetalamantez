import os
import shutil

def prepend_and_move_files(parent_folder):
    # Loop through each subfolder
    for root, dirs, files in os.walk(parent_folder):
        if root == parent_folder:
            # Skip the main folder, we want to process subfolders
            continue
        
        subfolder_name = os.path.basename(root)
        
        # Loop through each file in the subfolder
        for file in files:
            old_file_path = os.path.join(root, file)
            new_file_name = f"{subfolder_name}@{file}"
            new_file_path = os.path.join(parent_folder, new_file_name)  # Move to the parent folder
            
            # Rename and move the file
            shutil.move(old_file_path, new_file_path)
            print(f"Moved and renamed: {old_file_path} to {new_file_path}")

# Set the folder path
folder_path = r'c:\libgen'

# Call the function
prepend_and_move_files(folder_path)
