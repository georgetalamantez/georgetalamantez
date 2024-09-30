import json
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from collections import Counter

nltk.download('punkt')
nltk.download('stopwords')

# Load your JSON data from index.json
with open('c:/users/owner/downloads/listing/index.json', 'r', encoding='utf-8') as file:
    data = json.load(file)

word_frequencies = Counter()

# Process each entry
for key, entry in data.items():
    text = entry.get('title', '') + ' ' + entry.get('headings', '')
    tokens = word_tokenize(text.lower())
    tokens = [word for word in tokens if word.isalnum()]  # Remove punctuation
    tokens = [word for word in tokens if word not in stopwords.words('english')]  # Remove stopwords
    word_frequencies.update(tokens)

# Display the most common words
most_common = word_frequencies.most_common(10)
print(most_common)
