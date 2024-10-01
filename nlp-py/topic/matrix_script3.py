import os
import numpy as np
from sklearn.feature_extraction.text import CountVectorizer
from scipy.sparse import vstack

# Path to your folder with .txt files
folder_path = 'path_to_your_folder'
file_names = [f for f in os.listdir(folder_path) if f.endswith(".txt")]

# Batch size
batch_size = 10
vectorizer = CountVectorizer(stop_words='english', max_df=0.95, min_df=2, max_features=10000)

# Accumulate batches
dtm_list = []  # To store the sparse matrices for each batch
all_file_names = []  # To store file names from all batches

# Function to process a batch of files
def process_batch(file_names_batch):
    documents = []
    for file_name in file_names_batch:
        with open(os.path.join(folder_path, file_name), 'r', encoding='utf-8', errors='ignore') as file:
            documents.append(file.read())
    return vectorizer.fit_transform(documents)  # Generate the DTM for the batch

# Loop through the files in batches
for i in range(0, len(file_names), batch_size):
    batch_files = file_names[i:i+batch_size]  # Get the current batch of files
    all_file_names.extend(batch_files)  # Add the batch's file names to the global list
    dtm_batch = process_batch(batch_files)  # Process the current batch
    dtm_list.append(dtm_batch)  # Append the sparse matrix for the batch

# Combine all the batches into one DTM (vstack combines sparse matrices)
combined_dtm = vstack(dtm_list)

# If needed, save the combined DTM (for sparse matrices)
from scipy.sparse import save_npz
save_npz('combined_dtm.npz', combined_dtm)

# If you need to convert to a dense matrix for further analysis (careful with memory)
# dense_dtm = combined_dtm.toarray()
