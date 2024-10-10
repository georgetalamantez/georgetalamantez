import requests
import re
import os

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
def upload_file(file_path, cookie, file_number, total_files):
    url = "https://finder.btfs.io/api/v1/gateway/upload_file"
    
    # Headers from the original session, without Content-Type
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
        'Cookie': cookie
    }
    
    # The file to be uploaded
    files = {'file': open(file_path, 'rb')}
    
    # Log the current file being uploaded
    print(f"Uploading file {file_number} of {total_files}: {file_path}")
    
    # Send the POST request to upload the file
    response = requests.post(url, headers=headers, files=files)
    
    # Check the response
    if response.status_code == 200:
        print(f"File '{file_path}' uploaded successfully!")
        print("Response content:", response.content.decode('utf-8'))
    else:
        print(f"Failed to upload file '{file_path}'. Status code: {response.status_code}")
        print("Response:", response.text)

# Upload all files in a folder with progress logging
def upload_all_files_in_folder(folder_path, cookie):
    files_list = [f for f in os.listdir(folder_path) if os.path.isfile(os.path.join(folder_path, f))]
    total_files = len(files_list)
    
    # Loop through the files and upload each one
    for i, filename in enumerate(files_list, start=1):
        file_path = os.path.join(folder_path, filename)
        upload_file(file_path, cookie, i, total_files)

# Extract the cookie
cookie = extract_cookie(session_file)
if cookie:
    print("Cookie extracted successfully:", cookie)
    
    # Specify the folder containing the files you want to upload
    folder_path = "c:/users/owner/downloads/listing/libgen"  # Update this to your folder path
    
    # Upload all files in the folder using the extracted cookie with logging
    upload_all_files_in_folder(folder_path, cookie)
else:
    print("Cookie not found in the session file.")
