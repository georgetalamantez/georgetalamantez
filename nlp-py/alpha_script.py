import json

# Load the index-html.json file
with open('index-html.json', 'r', encoding='utf-8') as file:
    data = json.load(file)

# Extract and clean the headings
headings = set()  # Use a set to avoid duplicates
for entry in data.values():
    heading = entry.get('headings')
    if heading:
        # Remove leading/trailing spaces, tabs, and special characters
        cleaned_heading = heading.strip().replace('\t', '').replace('\n', '')
        # Only add non-empty, cleaned headings
        if cleaned_heading:
            headings.add(cleaned_heading)

# Alphabetize the unique headings
headings = sorted(headings)

# Write the cleaned, alphabetized headings to a .txt file
with open('alphabetized_headings.txt', 'w', encoding='utf-8') as output_file:
    for heading in headings:
        output_file.write(heading + '\n')

print(f"Cleaned and alphabetized headings have been written to 'alphabetized_headings.txt'.")
