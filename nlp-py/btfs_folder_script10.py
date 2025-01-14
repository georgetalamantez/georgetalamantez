import requests
import re
import os
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

# Crossref API base URL
crossref_url = "https://api.crossref.org/works/"

# Paths to files for session, logs, etc.
session_file = "c:/users/owner/downloads/request_session.txt"
log_file = "c:/users/owner/downloads/upload_log.txt"
failed_log_file = "c:/users/owner/downloads/failed_uploads.txt"

# Extract the cookie from the session file
def extract_cookie(session_file):
    with open(session_file, 'r') as file:
        data = file.read()
        cookie_match = re.search(r'Cookie: (.*)', data)
        if cookie_match:
            return cookie_match.group(1)
        return None

# Function to retrieve title using Crossref API
def get_title_from_doi(doi):
    # Convert '@' to '/' for the correct DOI format
    doi = doi.replace('@', '/')
    try:
        response = requests.get(f"{crossref_url}{doi}")
        if response.status_code == 200:
            data = response.json()
            return data['message']['title'][0]
        else:
            print(f"Failed to retrieve title for DOI {doi}: Status code {response.status_code}")
    except Exception as e:
        print(f"Error retrieving title for DOI {doi}: {e}")
    return "Unknown Title"

# Upload file with retry logic, logging the response from the API, and adding title metadata
def upload_file(file_path, cookie, file_number, total_files):
    url = "https://finder.btfs.io/api/v1/gateway/upload_file"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
        'Cookie': cookie
    }
    
    # Extract DOI from the file name (assuming the file is named as DOI.pdf)
    filename = os.path.basename(file_path)
    doi = os.path.splitext(filename)[0]  # Remove the file extension

    # Fetch the title using the DOI
    title = get_title_from_doi(doi)

    max_retries = 2
    for attempt in range(max_retries + 1):
        try:
            with open(file_path, 'rb') as file_to_upload:
                # Add the title to the 'describe' field
                files = {
                    'file': file_to_upload,
                    'describe': (None, title)
                }
                print(f"Uploading file {file_number} of {total_files}: {file_path} (Attempt {attempt + 1})")
                response = requests.post(url, headers=headers, files=files)
                
                if response.status_code == 200:
                    print(f"File '{file_path}' uploaded successfully with title '{title}'!")
                    print("Response content:", response.content.decode('utf-8'))
                    return True  # Return True on successful upload
                elif response.status_code == 504:
                    print(f"Gateway Timeout (504) encountered. Retrying {attempt + 1}/{max_retries}...")
                    if attempt < max_retries:
                        time.sleep(2)
                    else:
                        print(f"Max retries reached. Failed to upload file '{file_path}'.")
                else:
                    print(f"Failed to upload file '{file_path}'. Status code: {response.status_code}")
                    print("Response:", response.text)
                    break
        except Exception as e:
            print(f"An error occurred: {e}")
            break
    return False  # Return False on failure

# Save the successfully uploaded file name to the log
def log_uploaded_file(file_path):
    with open(log_file, 'a') as log:
        log.write(f"{file_path}\n")

# Save the failed upload file name to the failed log
def log_failed_upload(file_path):
    with open(failed_log_file, 'a') as log:
        log.write(f"{file_path}\n")

# Load the list of uploaded files from the log
def load_uploaded_files():
    if os.path.exists(log_file):
        with open(log_file, 'r') as log:
            return set(log.read().splitlines())
    return set()

# Load the list of failed uploads from the failed log
def load_failed_uploads():
    if os.path.exists(failed_log_file):
        with open(failed_log_file, 'r') as log:
            return set(log.read().splitlines())
    return set()

# Main upload function with progress tracking and retrying failed uploads first
def upload_all_files_in_folder(folder_path, cookie):
    uploaded_files = load_uploaded_files()
    failed_files = load_failed_uploads()
    
    # Combine failed files with new files to upload
    files_list = list(failed_files) + [
        os.path.join(folder_path, f) for f in os.listdir(folder_path)
        if os.path.isfile(os.path.join(folder_path, f)) and os.path.join(folder_path, f) not in uploaded_files
    ]
    total_files = len(files_list)
    
    print(f"Total files to upload (including failed retries): {total_files}")
    uploaded_count = 0
    
    with ThreadPoolExecutor(max_workers=3) as executor:
        futures = {
            executor.submit(upload_file, file_path, cookie, idx + 1, total_files): file_path
            for idx, file_path in enumerate(files_list)
        }
        
        for future in as_completed(futures):
            file_path = futures[future]
            try:
                if future.result():
                    log_uploaded_file(file_path)
                    uploaded_count += 1
                else:
                    log_failed_upload(file_path)
                
                # Display progress
                print(f"Progress: {uploaded_count}/{total_files} files uploaded.")
            except Exception as e:
                print(f"Error with file {file_path}: {e}")
                log_failed_upload(file_path)

# Extract the cookie
cookie = extract_cookie(session_file)
if cookie:
    print("Cookie extracted successfully:", cookie)
    
    # Specify the folder containing the files you want to upload
    folder_path = "c:/users/owner/downloads/listing/libgen"
    
    # Upload all files in the folder using the extracted cookie with concurrent uploads and progress tracking
    upload_all_files_in_folder(folder_path, cookie)
else:
    print("Cookie not found in the session file.")
