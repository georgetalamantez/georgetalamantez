import logging
from bertopic import BERTopic
import json
import time

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Start logging
logging.info("Script started")

# Load your index.json file (ensure it's read in UTF-8)
start_time = time.time()
try:
    with open('c:/users/owner/downloads/listing/index.json', 'r', encoding='utf-8') as f:
        index_data = json.load(f)
    logging.info(f"Successfully loaded index.json file in {time.time() - start_time:.2f} seconds")
except Exception as e:
    logging.error(f"Failed to load index.json file: {e}")
    raise

# Extract headings and titles (use headings if title is empty)
documents = []
logging.info("Extracting documents from index_data")
for idx, file_data in enumerate(index_data.values()):
    document = file_data['title'] + " " + file_data['headings'] if file_data['title'] else file_data['headings']
    documents.append(document)
    if idx % 1000 == 0:  # Log progress every 1000 documents
        logging.info(f"Processed {idx} documents")

logging.info(f"Finished processing {len(documents)} documents")

# Initialize and fit BERTopic on the extracted documents
logging.info("Starting BERTopic model fitting")
try:
    topic_model = BERTopic()
    topics, probs = topic_model.fit_transform(documents)
    logging.info("Successfully fit the BERTopic model")
except Exception as e:
    logging.error(f"Failed to fit BERTopic model: {e}")
    raise

# View the resulting topics
logging.info("Retrieving and displaying topic information")
print(topic_model.get_topic_info())
logging.info("Script finished")
