from bertopic import BERTopic
import json

# Load your index.json file (ensure it's read in UTF-8)
with open('c:/users/owner/downloads/listing/index.json', 'r', encoding='utf-8') as f:
    index_data = json.load(f)

# Extract headings and titles (use headings if title is empty)
documents = []
for file_data in index_data.values():
    # Combine title and heading if title is non-empty
    document = file_data['title'] + " " + file_data['headings'] if file_data['title'] else file_data['headings']
    documents.append(document)

# Initialize and fit BERTopic on the extracted documents
topic_model = BERTopic()
topics, probs = topic_model.fit_transform(documents)

# View the resulting topics
print(topic_model.get_topic_info())
