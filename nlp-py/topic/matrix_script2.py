import os
from sklearn.feature_extraction.text import CountVectorizer
import pandas as pd
from scipy.sparse import save_npz

folder_path = 'path_to_your_folder'
documents = []
file_names = []

for file_name in os.listdir(folder_path):
    if file_name.endswith(".txt"):
        file_names.append(file_name)
        with open(os.path.join(folder_path, file_name), 'r', encoding='utf-8', errors='ignore') as file:
            documents.append(file.read())

# Create the document-term matrix with reduced dimensionality
vectorizer = CountVectorizer(stop_words='english', max_df=0.95, min_df=2, max_features=10000)
X = vectorizer.fit_transform(documents)

# Convert the sparse matrix to a DataFrame (only for small data, otherwise use sparse representation)
df = pd.DataFrame(X.toarray(), index=file_names, columns=vectorizer.get_feature_names_out())
print(df)

# Optionally save the sparse matrix to disk
save_npz('dtm_sparse_matrix.npz', X)
