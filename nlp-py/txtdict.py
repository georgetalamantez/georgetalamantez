import json
from collections import defaultdict

# Load the index.json file
with open("index.json", "r") as file:
    index_data = json.load(file)

# Initialize a dictionary to store the keyword counts
keyword_counts = defaultdict(int)

# Process each file entry in the index
for file_entry in index_data.values():
    # Iterate over all keywords in the current file entry
    for key, value in file_entry.items():
        if key.startswith("keyword") and value:  # Check if it's a keyword and has a non-empty value
            keyword_counts[value] += 1

# Convert defaultdict to a regular dictionary and alphabetize it
keyword_counts = dict(sorted(keyword_counts.items()))

# Print the alphabetized keyword counts
print("Alphabetized Keyword Counts:")
for keyword, count in keyword_counts.items():
    print(f"{keyword}: {count}")

# Save the alphabetized results to a JSON file (optional)
with open("alphabetized_keyword_counts.json", "w") as output_file:
    json.dump(keyword_counts, output_file, indent=4)

print("\nResults saved to 'alphabetized_keyword_counts.json'.")
