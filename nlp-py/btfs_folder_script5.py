import requests
import re
import os
import time

# Path to the request session file
session_file = "c:/users/owner/downloads/request_session.txt"
log_file = "c:/users/owner/downloads/upload_log.txt"  # Log file to track successful uploads
failed_log_file = "c:/users/owner/downloads/failed_uploads.txt"  # Log file to track failed uploads

# Extract the cookie from the session file
def extract_cookie(session_file):
    with open(session_file, 'r') as file:
        data = file.read()
        cookie_match = re.search(r'Cookie: (.*)', data)
        if cookie_match:
            return cookie_match.group(1)
        return None

# Perform file upload using the extracted cookie, with retry logic for 504 error
def upload_file(file_path, cookie, file_number, total_files):
    url = "https://finder.btfs.io/api/v1/gateway/upload_file"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
        'Cookie': cookie
    }
    
    max_retries = 2
    for attempt in range(max_retries + 1):
        try:
            with open(file_path, 'rb') as file_to_upload:
                files = {'file': file_to_upload}
                print(f"Uploading file {file_number} of {total_files}: {file_path} (Attempt {attempt + 1})")
                response = requests.post(url, headers=headers, files=files)
                if response.status_code == 200:
                    print(f"File '{file_path}' uploaded successfully!")
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

# Remove a successfully uploaded file from the failed log
def remove_from_failed_log(file_path):
    if os.path.exists(failed_log_file):
        with open(failed_log_file, 'r') as log:
            lines = log.readlines()
        with open(failed_log_file, 'w') as log:
            for line in lines:
                if line.strip() != file_path:
                    log.write(line)

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

# Upload all files in a folder with progress tracking, retry failed uploads first
def upload_all_files_in_folder(folder_path, cookie):
    uploaded_files = load_uploaded_files()  # Load the uploaded files log
    failed_files = load_failed_uploads()  # Load the failed files log
    files_list = [f for f in os.listdir(folder_path) if os.path.isfile(os.path.join(folder_path, f))]
    total_files = len(files_list)
    
    # Retry failed uploads first
    for i, failed_file_path in enumerate(failed_files, start=1):
        if upload_file(failed_file_path, cookie, i, total_files):
            # Log the uploaded file and remove it from the failed log upon success
            log_uploaded_file(failed_file_path)
            remove_from_failed_log(failed_file_path)

    # Proceed with normal upload process for remaining files
    for i, filename in enumerate(files_list, start=1):
        file_path = os.path.join(folder_path, filename)
        
        # Skip already uploaded files
        if file_path in uploaded_files:
            print(f"File '{file_path}' already uploaded. Skipping.")
            continue

        # Upload the file
        if upload_file(file_path, cookie, i, total_files):
            # Log the uploaded file upon successful upload
            log_uploaded_file(file_path)
        else:
            # Log the failed upload
            log_failed_upload(file_path)

# Extract the cookie
cookie = extract_cookie(session_file)
if cookie:
    print("Cookie extracted successfully:", cookie)
    
    # Specify the folder containing the files you want to upload
    folder_path = "c:/users/owner/downloads/listing/libgen"
    
    # Upload all files in the folder using the extracted cookie with progress tracking
    upload_all_files_in_folder(folder_path, cookie)
else:
    print("Cookie not found in the session file.")
