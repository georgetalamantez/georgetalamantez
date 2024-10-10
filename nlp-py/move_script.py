import os
import shutil
from transformers import RobertaTokenizer, RobertaForSequenceClassification
import torch

# Initialize CodeBERT model and tokenizer
tokenizer = RobertaTokenizer.from_pretrained("microsoft/codebert-base")
model = RobertaForSequenceClassification.from_pretrained("microsoft/codebert-base", num_labels=2)  # Binary classification (code or not)

# Define function to classify if a text contains code
def contains_code(text):
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=512)
    outputs = model(**inputs)
    logits = outputs.logits
    probabilities = torch.softmax(logits, dim=-1)
    predicted_class = torch.argmax(probabilities).item()
    return predicted_class == 1  # Assuming class 1 represents code

# Function to detect code and move files
def detect_code_and_move_files(src_folder, dest_folder, file_limit=500):
    txt_files = [f for f in os.listdir(src_folder) if f.endswith('.txt')]
    files_moved = 0

    # Ensure destination folder exists
    if not os.path.exists(dest_folder):
        os.makedirs(dest_folder)

    for file_name in txt_files:
        if files_moved >= file_limit:
            break

        file_path = os.path.join(src_folder, file_name)

        # Read file contents
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as file:
            file_content = file.read()

            # Check if file contains code
            if contains_code(file_content):
                try:
                    # Try to move the file
                    shutil.move(file_path, os.path.join(dest_folder, file_name))
                    files_moved += 1
                    print(f"Moved {file_name}, total moved: {files_moved}")
                except PermissionError as e:
                    # Log the error and skip the file if it's in use or locked
                    print(f"Could not move {file_name}: {e}. Skipping to the next file.")
                except Exception as e:
                    # Log any other errors that might occur
                    print(f"An error occurred while moving {file_name}: {e}. Skipping to the next file.")

    print(f"Finished moving {files_moved} files containing code.")

# Specify source and destination folders
source_folder = "c:/users/owner/downloads/listing/pages"
destination_folder = "c:/users/owner/downloads/listing/500html"

# Call the function to move 500 files containing code
detect_code_and_move_files(source_folder, destination_folder, file_limit=500)
