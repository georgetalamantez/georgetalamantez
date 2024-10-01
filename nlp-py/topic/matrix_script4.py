import os
from sklearn.feature_extraction.text import CountVectorizer
import pandas as pd

# Folder path where text files are stored
folder_path = 'c:/users/owner/downloads/listing/pages'
file_names = [file_name for file_name in os.listdir(folder_path) if file_name.endswith(".txt")]

batch_size = 10
documents = []

# First, gather all documents to build a common vocabulary
for file_name in file_names:
    try:
        with open(os.path.join(folder_path, file_name), 'r', encoding='utf-8') as file:
            documents.append(file.read())
    except UnicodeDecodeError:
        with open(os.path.join(folder_path, file_name), 'r', encoding='latin-1') as file:
            documents.append(file.read())

# Create a common vectorizer with vocabulary learned from all documents
vectorizer = CountVectorizer()
vectorizer.fit(documents)  # Fit only once to build the common vocabulary

# Now process files in batches
all_dfs = []  # List to store dataframes for each batch

for i in range(0, len(file_names), batch_size):
    batch_file_names = file_names[i:i + batch_size]
    batch_documents = documents[i:i + batch_size]

    # Create the document-term matrix for the batch using the pre-built vocabulary
    X = vectorizer.transform(batch_documents)

    # Convert the result to a dataframe
    df = pd.DataFrame(X.toarray(), index=batch_file_names, columns=vectorizer.get_feature_names_out())
    
    # Append the dataframe to the list of all dataframes
    all_dfs.append(df)

# Aggregate all batch dataframes into one final dataframe
final_df = pd.concat(all_dfs)
print(final_df)
