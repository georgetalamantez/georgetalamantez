import requests
import re
import os
import time
import subprocess

# Paths to files for session, logs, etc.
session_file = "c:/users/owner/downloads/request_session.txt"

# Extract the cookie from the session file
def extract_cookie(session_file):
    with open(session_file, 'r') as file:
        data = file.read()
        cookie_match = re.search(r'Cookie: (.*)', data)
        if cookie_match:
            return cookie_match.group(1)
        return None

# Upload file with retry logic, logging the response from the API
def upload_file(file_path, cookie):
    url = "https://finder.btfs.io/api/v1/gateway/upload_file"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0',
        'sec-ch-ua': '"Microsoft Edge";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        'sec-ch-ua-platform': '"Windows"',
        'sec-ch-ua-mobile': '?0',
        'DNT': '1',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Dest': 'empty',
        'Referer': 'https://finder.btfs.io/',
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cookie': cookie
    }
    
    form_data = {
        'tags': '',
        'describe': '',
        'nameless': 'false',
        'is_private': 'false',
        'encrypted': 'false'
    }
    
    max_retries = 2
    for attempt in range(max_retries + 1):
        try:
            with open(file_path, 'rb') as file_to_upload:
                files = {'file': (os.path.basename(file_path), file_to_upload)}
                print(f"Uploading: {file_path} (Attempt {attempt + 1})")
                response = requests.post(url, headers=headers, files=files, data=form_data, verify=False)  # Disable SSL verification
                
                if response.status_code == 200:
                    print(f"File '{file_path}' uploaded successfully!")
                    print("API Response:", response.json())
                    return True
                elif response.status_code == 504:
                    print(f"Gateway Timeout (504) encountered. Retrying {attempt + 1}/{max_retries}...")
                    if attempt < max_retries:
                        time.sleep(2)
                    else:
                        print(f"Max retries reached. Failed to upload file '{file_path}'.")
                else:
                    print(f"Failed to upload file '{file_path}'. Status code: {response.status_code}")
                    print("API Response:", response.text)
                    break
        except Exception as e:
            print(f"An error occurred: {e}")
            # Try uploading with curl as fallback
            print("Attempting upload using curl as fallback...")
            return upload_file_with_curl(file_path, cookie)
    return False

# Upload file with curl as a fallback when SSL verification fails
def upload_file_with_curl(file_path, cookie):
    url = "https://finder.btfs.io/api/v1/gateway/upload_file"
    command = [
        "curl", "-k", "-X", "POST", url,
        "-H", f"Cookie: {cookie}",
        "-F", f"file=@{file_path}",
        "-F", "tags=",
        "-F", "describe=",
        "-F", "nameless=false",
        "-F", "is_private=false",
        "-F", "encrypted=false"
    ]
    print(f"Uploading {file_path} using curl...")
    result = subprocess.run(command, capture_output=True, text=True)
    if result.returncode == 0:
        print("Upload successful!")
        print("Response:", result.stdout)
        return True
    else:
        print("Upload failed with curl!")
        print("Error:", result.stderr)
        return False

# Delete the file if it was successfully uploaded
def delete_file(file_path):
    try:
        os.remove(file_path)
        print(f"Deleted file: {file_path}")
    except Exception as e:
        print(f"Failed to delete file {file_path}: {e}")

# Main upload function with progress tracking
def upload_all_files_in_folder(folder_path, cookie):
    files_list = [
        os.path.join(folder_path, f) for f in os.listdir(folder_path)
        if os.path.isfile(os.path.join(folder_path, f))
    ]
    
    # Sort files by size in ascending order
    files_list.sort(key=lambda f: os.path.getsize(f))
    
    total_files = len(files_list)
    
    print(f"Total files to upload: {total_files}")
    uploaded_count = 0
    
    for file_path in files_list:
        try:
            if upload_file(file_path, cookie):  # Upload each file sequentially
                delete_file(file_path)  # Delete file only if upload was successful
                uploaded_count += 1
            
            # Display progress
            print(f"Progress: {uploaded_count}/{total_files} files uploaded.")
        except Exception as e:
            print(f"Error with file {file_path}: {e}")

# Extract the cookie
cookie = extract_cookie(session_file)
if cookie:
    print("Cookie extracted successfully:", cookie)
    
    # Specify the folder containing the files you want to upload
    folder_path = "c:/users/owner/downloads/listing/libgen"
    
    # Upload all files in the folder using the extracted cookie with sequential uploads and progress tracking
    upload_all_files_in_folder(folder_path, cookie)
else:
    print("Cookie not found in the session file.")
