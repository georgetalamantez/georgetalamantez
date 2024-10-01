import os
from sklearn.feature_extraction.text import CountVectorizer

folder_path = 'c:/users/owner/downloads/listing/pages'
documents = []
file_names = []

for file_name in os.listdir(folder_path):
    if file_name.endswith(".txt"):
        file_names.append(file_name)
        try:
            with open(os.path.join(folder_path, file_name), 'r', encoding='utf-8') as file:
                documents.append(file.read())
        except UnicodeDecodeError:
            # Try reading with a different encoding if utf-8 fails
            with open(os.path.join(folder_path, file_name), 'r', encoding='latin-1') as file:
                documents.append(file.read())

# Create the document-term matrix
vectorizer = CountVectorizer()
X = vectorizer.fit_transform(documents)

import pandas as pd
df = pd.DataFrame(X.toarray(), index=file_names, columns=vectorizer.get_feature_names_out())
print(df)
