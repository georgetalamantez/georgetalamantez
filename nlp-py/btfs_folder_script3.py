import requests
import re
import os
import time

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

# Perform file upload using the extracted cookie, with retry logic for 504 error
def upload_file(file_path, cookie, file_number, total_files):
    url = "https://finder.btfs.io/api/v1/gateway/upload_file"
    
    # Headers from the original session, without Content-Type
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
        'Cookie': cookie
    }
    
    # Retry logic for uploading the file
    max_retries = 2
    for attempt in range(max_retries + 1):
        try:
            # Re-open the file on each attempt to ensure the file pointer is reset
            with open(file_path, 'rb') as file_to_upload:
                files = {'file': file_to_upload}

                # Log the current file being uploaded
                print(f"Uploading file {file_number} of {total_files}: {file_path} (Attempt {attempt + 1})")

                # Send the POST request to upload the file
                response = requests.post(url, headers=headers, files=files)

                # Check if upload was successful
                if response.status_code == 200:
                    print(f"File '{file_path}' uploaded successfully!")
                    print("Response content:", response.content.decode('utf-8'))
                    break
                elif response.status_code == 504:
                    # Retry if 504 Gateway Timeout occurs
                    print(f"Gateway Timeout (504) encountered. Retrying {attempt + 1}/{max_retries}...")
                    if attempt < max_retries:
                        time.sleep(2)  # Delay before retrying
                    else:
                        print(f"Max retries reached. Failed to upload file '{file_path}'.")
                else:
                    print(f"Failed to upload file '{file_path}'. Status code: {response.status_code}")
                    print("Response:", response.text)
                    break  # No retry for other errors
        except Exception as e:
            print(f"An error occurred: {e}")
            break

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
