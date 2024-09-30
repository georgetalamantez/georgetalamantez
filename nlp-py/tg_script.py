# Necessary imports
import json
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from gensim import corpora
from gensim.models.ldamodel import LdaModel
from gensim.models import Phrases
from gensim.models.phrases import Phraser

# Ensure you have the necessary NLTK resources downloaded
nltk.download('punkt')
nltk.download('stopwords')

# Load stopwords
stop_words = set(stopwords.words('english'))

# Path to your JSON file (index.json)
json_path = 'c:/users/owner/downloads/listing/index.json'

# Step 1: Preprocess the text (bigrams and trigrams)
with open(json_path, 'r', encoding='utf-8') as file:
    data = json.load(file)

texts = []

for file_name, file_data in data.items():
    # Extract the title and headings from the JSON file
    title = file_data.get('title', '').lower()
    headings = file_data.get('headings', '').lower()
    
    # Tokenize the title and headings
    tokens = word_tokenize(title) + word_tokenize(headings)
    
    # Filter out stopwords and non-alphabetic words
    tokens = [word for word in tokens if word.isalpha() and word not in stop_words]
    
    # Add the tokens to our texts list
    texts.append(tokens)

# Step 2: Build bigrams and trigrams
bigram = Phrases(texts, min_count=5, threshold=100)
trigram = Phrases(bigram[texts], threshold=100)

bigram_mod = Phraser(bigram)
trigram_mod = Phraser(trigram)

# Form the bigram/trigram tokens
data_bigrams_trigrams = [trigram_mod[bigram_mod[doc]] for doc in texts]

# Step 3: Create a dictionary and corpus for LDA
dictionary = corpora.Dictionary(data_bigrams_trigrams)

# Filter out extremes to limit the number of features in the dictionary
dictionary.filter_extremes(no_below=5, no_above=0.5)

# Convert the list of documents (corpus) into Document Term Matrix using the dictionary
corpus = [dictionary.doc2bow(text) for text in data_bigrams_trigrams]

# Step 4: Train the LDA model
num_topics = 10  # Number of topics you want to discover
lda_model = LdaModel(corpus, num_topics=num_topics, id2word=dictionary, passes=15)

# Step 5: Print the topics and the most significant words in each topic
print("LDA Model: Topics and Words")
for idx, topic in lda_model.print_topics(num_topics=num_topics, num_words=10):
    print(f"Topic #{idx}: {topic}")
