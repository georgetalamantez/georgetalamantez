import gensim
from gensim.models import Phrases
from gensim.models.phrases import Phraser
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import nltk
import json

# Download stopwords if you haven't already
nltk.download('punkt')
nltk.download('stopwords')

# Load the stopwords
stop_words = set(stopwords.words('english'))

# Load the index.json (adjust the path to your file)
with open("c:/users/owner/downloads/listing/index.json", 'r', encoding='utf-8') as f:
    data = json.load(f)

# Extract titles and headings for processing
texts = []
for file_data in data.values():
    # Tokenize and clean the text
    words = word_tokenize(file_data.get('title', '') + ' ' + file_data.get('headings', '').lower())
    words = [word for word in words if word.isalpha() and word not in stop_words]
    texts.append(words)

# Build bigrams and trigrams
bigram_model = Phrases(texts, min_count=5, threshold=10)  # Higher threshold means fewer phrases
trigram_model = Phrases(bigram_model[texts], threshold=10)

# Phrasers to optimize memory
bigram_phraser = Phraser(bigram_model)
trigram_phraser = Phraser(trigram_model)

# Apply the models to the texts
bigram_texts = [bigram_phraser[text] for text in texts]
trigram_texts = [trigram_phraser[bigram_phraser[text]] for text in texts]

# Example output (first 10 texts with bigrams and trigrams)
print(trigram_texts[:10])
