import os
import json
import logging
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.decomposition import LatentDirichletAllocation
from nltk.corpus import stopwords

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Initialize stopwords and set up directory
stop_words = set(stopwords.words('english'))
folder_path = "c:/users/owner/downloads/listing/pages"
index = {}

# Function to preprocess text
def preprocess(text):
    tokens = text.lower().split()
    return ' '.join([token for token in tokens if token.isalpha() and token not in stop_words])

# Function to extract topics using LDA
def extract_keywords_from_topics(texts, num_topics=1, num_keywords=3):
    logging.info(f"Starting LDA topic extraction for {len(texts)} document(s)")
    
    if len(texts) == 1:
        # When processing a single document, don't use max_df and min_df to avoid issues
        vectorizer = CountVectorizer(stop_words='english')
    else:
        # For multiple documents, set reasonable thresholds
        vectorizer = CountVectorizer(max_df=0.95, min_df=2, stop_words='english')
    
    dtm = vectorizer.fit_transform(texts)
    lda_model = LatentDirichletAllocation(n_components=num_topics, random_state=42)
    lda_model.fit(dtm)
    
    keywords = []
    for topic_idx, topic in enumerate(lda_model.components_):
        keywords.append([vectorizer.get_feature_names_out()[i] for i in topic.argsort()[:-num_keywords - 1:-1]])
    logging.info(f"Extracted keywords: {keywords[0]}")
    return keywords[0]

# Traverse folder and process each .txt file
logging.info(f"Processing all .txt files in folder: {folder_path}")
for filename in os.listdir(folder_path):
    if filename.endswith('.txt'):
        logging.info(f"Processing file: {filename}")
        file_path = os.path.join(folder_path, filename)
        try:
            # Use errors='ignore' to skip over problematic characters
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as file:
                text = file.read()
                preprocessed_text = preprocess(text)
                logging.info(f"Text preprocessed for file: {filename}")
                
                # Extract topics and keywords
                keywords = extract_keywords_from_topics([preprocessed_text], num_keywords=3)
                
                # Build index entry
                index[filename] = {
                    'title': filename,  # You can customize title extraction logic here
                    'keyword1': keywords[0] if len(keywords) > 0 else None,
                    'keyword2': keywords[1] if len(keywords) > 1 else None,
                    'keyword3': keywords[2] if len(keywords) > 2 else None
                }
                logging.info(f"Finished processing file: {filename}")
        except Exception as e:
            logging.error(f"Failed to process file {filename}: {e}")

# Save to index.json
output_path = "./index.json"
logging.info(f"Saving index to {output_path}")
with open(output_path, 'w', encoding='utf-8') as json_file:
    json.dump(index, json_file, indent=4)

logging.info(f"Index saved successfully to {output_path}")
