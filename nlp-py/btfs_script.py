import requests
import re

# Path to the request session file
session_file = "c:/users/owner/downloads/request_session.txt"

# Extract the cookie from the session file
def extract_cookie(session_file):
    with open(session_file, 'r') as file:
        data = file.read()
        # Look for 'Cookie:' followed by any characters until a new line
        cookie_match = re.search(r'Cookie: (.*)', data)
        if cookie_match:
            return cookie_match.group(1)
        return None

# Perform file upload using the extracted cookie
def upload_file(file_path, cookie):
    url = "https://finder.btfs.io/api/v1/gateway/upload_file"
    
    # Headers from the original session, without Content-Type
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
        'Cookie': cookie
    }
    
    # The file to be uploaded
    files = {'file': open(file_path, 'rb')}
    
    # Send the POST request to upload the file
    response = requests.post(url, headers=headers, files=files)
    
    # Check the response
    if response.status_code == 200:
        print("File uploaded successfully!")
        # Print the response content for more details
        print("Response content:", response.content.decode('utf-8'))
    else:
        print(f"Failed to upload file. Status code: {response.status_code}")
        print("Response:", response.text)

# Extract the cookie
cookie = extract_cookie(session_file)
if cookie:
    print("Cookie extracted successfully:", cookie)
    # Specify the path of the file you want to upload
    file_path = "c:/users/owner/downloads/listing/libgen/10.3390_app11115062.pdf"  # Update this to your file path
    # Upload the file using the extracted cookie
    upload_file(file_path, cookie)
else:
    print("Cookie not found in the session file.")
