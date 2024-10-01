import json
from sklearn.cluster import KMeans
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from collections import Counter
import numpy as np
import nltk

# Ensure you have the necessary NLTK tokenizers and stopwords downloaded
nltk.download('punkt')
nltk.download('stopwords')

def generate_word_frequencies(data):
    stop_words = set(stopwords.words('english'))
    
    for key, file_data in data.items():
        title_tokens = word_tokenize(file_data.get('title', '').lower())
        heading_tokens = word_tokenize(file_data.get('headings', '').lower())
        tokens = [token for token in title_tokens + heading_tokens if token not in stop_words]

        freq_map = {}
        for token in tokens:
            freq_map[token] = freq_map.get(token, 0) + 1
        
        yield freq_map

def process_batches(file_path, batch_size=10):
    word_frequencies = []
    
    with open(file_path, 'r', encoding='utf-8') as file:
        try:
            data = json.load(file)
            keys = list(data.keys())
            total_batches = len(keys) // batch_size + (len(keys) % batch_size > 0)

            for batch_index in range(total_batches):
                batch_keys = keys[batch_index * batch_size : (batch_index + 1) * batch_size]
                batch_data = {key: data[key] for key in batch_keys}
                
                # Generate word frequencies for the current batch
                word_frequencies.extend(generate_word_frequencies(batch_data))
                print(f"Processed batch {batch_index + 1}/{total_batches}")

        except json.JSONDecodeError as e:
            print(f"JSON decode error: {e}")

    return word_frequencies

# Update the path to your JSON file
file_path = 'c:/users/owner/downloads/listing/index.json'

# Process the JSON file in batches
word_frequencies = process_batches(file_path, batch_size=10)

print('Finished processing the JSON file.')

def word_frequencies_to_vectors(word_frequencies, top_n=1000):
    all_words = Counter()
    for freq_map in word_frequencies:
        all_words.update(freq_map)

    # Get the top N most common words
    most_common_words = all_words.most_common(top_n)
    words_array = [word for word, _ in most_common_words]

    # Create vectors
    vectors = []
    for freq_map in word_frequencies:
        vector = [freq_map.get(word, 0) for word in words_array]
        vectors.append(vector)

    return np.array(vectors), words_array

# Convert word frequencies to vectors
vectors, words_array = word_frequencies_to_vectors(word_frequencies)

# Set the number of clusters
num_clusters = 3
kmeans = KMeans(n_clusters=num_clusters)
kmeans.fit(vectors)
clusters = kmeans.labels_

print('Clustering Result:')
print(clusters)
