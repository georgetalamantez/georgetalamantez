import requests
import re
import os
import time

# Paths
session_file = "c:/users/owner/downloads/request_session.txt"
log_file = "c:/users/owner/downloads/upload_log.txt"
failed_log_file = "c:/users/owner/downloads/failed_uploads.txt"

# Utility to read and write log files
def read_log(file_path):
    if os.path.exists(file_path):
        with open(file_path, 'r') as file:
            return set(file.read().splitlines())
    return set()

def write_log(file_path, entry, remove_entry=False):
    if remove_entry:
        lines = read_log(file_path)
        lines.discard(entry)
        with open(file_path, 'w') as file:
            file.write('\n'.join(lines) + '\n')
    else:
        with open(file_path, 'a') as file:
            file.write(f"{entry}\n")

# Extract cookie from session file
def extract_cookie(file_path):
    with open(file_path, 'r') as file:
        match = re.search(r'Cookie: (.*)', file.read())
        return match.group(1) if match else None

# Upload file with retry for 504 errors
def upload_file(file_path, cookie, file_number, total_files, max_retries=2):
    url = "https://finder.btfs.io/api/v1/gateway/upload_file"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
        'Cookie': cookie
    }
    
    for attempt in range(max_retries + 1):
        try:
            print(f"Uploading file {file_number}/{total_files}: {file_path} (Attempt {attempt + 1}/{max_retries})")
            with open(file_path, 'rb') as file_to_upload:
                response = requests.post(url, headers=headers, files={'file': file_to_upload})
                if response.status_code == 200:
                    print(f"Uploaded: {file_path}")
                    return True
                elif response.status_code == 504 and attempt < max_retries:
                    time.sleep(2)  # Delay before retry
        except Exception as e:
            print(f"Error: {e}")
            break
    return False

# Upload all files, retrying failed ones first
def upload_all_files(folder_path, cookie):
    print("Starting upload process.")
    uploaded_files = read_log(log_file)
    failed_files = read_log(failed_log_file)
    all_files = [os.path.join(folder_path, f) for f in os.listdir(folder_path) if os.path.isfile(os.path.join(folder_path, f))]
    total_files = len(all_files)
    
    # Retry failed files
    for i, failed_file in enumerate(failed_files, start=1):
        if upload_file(failed_file, cookie, i, total_files):
            write_log(log_file, failed_file)
            write_log(failed_log_file, failed_file, remove_entry=True)
    
    # Upload remaining files
    for i, file_path in enumerate(all_files, start=1):
        if file_path in uploaded_files:
            continue
        if upload_file(file_path, cookie, i, total_files):
            write_log(log_file, file_path)
        else:
            write_log(failed_log_file, file_path)

# Main execution
cookie = extract_cookie(session_file)
if cookie:
    upload_all_files("c:/users/owner/downloads/listing/libgen", cookie)
else:
    print("Cookie not found.")
