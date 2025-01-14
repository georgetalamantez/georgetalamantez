import os

def prepend_folder_name_to_files(folder_path):
    # Get the parent folder name
    parent_folder_name = os.path.basename(os.path.normpath(folder_path))

    # Iterate through all files in the folder
    for filename in os.listdir(folder_path):
        file_path = os.path.join(folder_path, filename)
        
        # Ensure we're working with files only
        if os.path.isfile(file_path):
            # New file name with the parent folder name prepended
            new_filename = f"{parent_folder_name}@{filename}"
            new_file_path = os.path.join(folder_path, new_filename)

            # Rename the file
            os.rename(file_path, new_file_path)
            print(f"Renamed '{filename}' to '{new_filename}'")

# Example usage
folder_path = r"C:/Users/Owner/Downloads/listing/libgen/10.1159"  # Update this with the path to your folder
prepend_folder_name_to_files(folder_path)
