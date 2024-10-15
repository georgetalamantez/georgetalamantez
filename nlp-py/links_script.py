import re

# Path to the log file
log_file_path = 'c:/users/owner/documents/log.txt'

# Path to save the output HTML file
html_file_path = './pdf_links.html'

# Base URL for BTFS gateway
base_url = "https://gateway.btfs.io/btfs/"

# Pattern to match the file name and CID in the log
filename_pattern = r"File '([^']+)' uploaded successfully!"
cid_pattern = r'"cid":"([^"]+)"'

# Lists to store filenames and corresponding CIDs
file_links = []

# Open the log file and extract filenames and CIDs
with open(log_file_path, 'r') as log_file:
    log_content = log_file.read()
    
    # Find all filenames and CIDs
    filenames = re.findall(filename_pattern, log_content)
    cids = re.findall(cid_pattern, log_content)
    
    # Combine filenames and CIDs into links
    for filename, cid in zip(filenames, cids):
        file_name = filename.split("\\")[-1]  # Extract only the filename
        doi = file_name  # Assuming the filename is the DOI
        file_link = f'<a href="{base_url}{cid}">{doi}</a>'
        file_links.append(file_link)

# Write the links to an HTML file
with open(html_file_path, 'w') as html_file:
    html_file.write("<html>\n<head>\n<title>PDF Links</title>\n</head>\n<body>\n")
    html_file.write("<h1>PDF Links</h1>\n")
    
    # Write each link without bullets
    for link in file_links:
        html_file.write(f"{link}<br>\n")  # Using <br> for line breaks instead of <li>
    
    html_file.write("</body>\n</html>")

print("HTML file created successfully!")
