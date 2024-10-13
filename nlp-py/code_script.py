import os
import shutil
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

# Load CodeBERT tokenizer and model (for classification or code understanding)
tokenizer = AutoTokenizer.from_pretrained("microsoft/codebert-base")
model = AutoModelForSequenceClassification.from_pretrained("microsoft/codebert-base")

# Function to determine if the text contains code
def is_code_snippet(text, threshold=0.9):
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)
    outputs = model(**inputs)
    logits = outputs.logits
    probabilities = torch.softmax(logits, dim=1)
    
    # Get the probability for class 1 (code)
    code_prob = probabilities[0][1].item()
    
    # Move only if the probability exceeds the threshold
    return code_prob >= threshold

# Folder paths
source_folder = "c:/users/owner/downloads/listing/pages"   # Folder containing the .txt files
destination_folder = "path"  # Folder to move files with code

# Ensure the destination folder exists
os.makedirs(destination_folder, exist_ok=True)

# Iterate over all .txt files in the source folder
for filename in os.listdir(source_folder):
    if filename.endswith(".txt"):
        source_file_path = os.path.join(source_folder, filename)
        
        # Attempt to read the file, handling encoding errors
        try:
            with open(source_file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except UnicodeDecodeError:
            # Retry with a different encoding
            with open(source_file_path, 'r', encoding='ISO-8859-1') as f:
                content = f.read()

        # Check if the file contains code with a confidence threshold
        if is_code_snippet(content, threshold=0.9):
            # Move the file to the destination folder if code is detected
            destination_file_path = os.path.join(destination_folder, filename)
            shutil.move(source_file_path, destination_file_path)
            print(f"Moved {filename} to {destination_folder}")
        else:
            print(f"No code found in {filename}, file not moved.")
