import requests
import re
import os
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from config import Config
from logger import get_log_handler, load_logged_files, remove_from_failed_log
from decorators import log_action

@log_action(get_log_handler("upload"))
def extract_cookie(session_file):
    with open(session_file, 'r') as file:
        data = file.read()
        cookie_match = re.search(r'Cookie: (.*)', data)
        return cookie_match.group(1) if cookie_match else None

@log_action(get_log_handler("upload"))
def upload_file(file_path, cookie):
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
                print(f"Uploading: {file_path} (Attempt {attempt + 1})")
                response = requests.post(url, headers=headers, files=files)
                if response.status_code == 200:
                    print(f"File '{file_path}' uploaded successfully! Response: {response.json()}")
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
            break
    return False

@log_action(get_log_handler("upload"))
def delete_file(file_path):
    try:
        os.remove(file_path)
        print(f"Deleted file: {file_path}")
    except Exception as e:
        print(f"Failed to delete file {file_path}: {e}")

def upload_all_files_in_folder(folder_path, cookie):
    uploaded_files = load_logged_files(Config().log_file)
    failed_files = load_logged_files(Config().failed_log_file)
    
    files_list = list(failed_files) + [
        os.path.join(folder_path, f) for f in os.listdir(folder_path)
        if os.path.isfile(os.path.join(folder_path, f)) and os.path.join(folder_path, f) not in uploaded_files
    ]
    total_files = len(files_list)
    
    print(f"Total files to upload (including failed retries): {total_files}")
    uploaded_count = 0
    
    with ThreadPoolExecutor(max_workers=3) as executor:
        futures = {executor.submit(upload_file, file_path, cookie): file_path for file_path in files_list}
        
        for future in as_completed(futures):
            file_path = futures[future]
            try:
                if future.result():
                    log_handler = get_log_handler("upload")
                    log_handler.log(file_path)
                    delete_file(file_path)
                    uploaded_count += 1
                else:
                    log_handler = get_log_handler("failed")
                    log_handler.log(file_path)
                
                print(f"Progress: {uploaded_count}/{total_files} files uploaded.")
            except Exception as e:
                print(f"Error with file {file_path}: {e}")
                log_handler = get_log_handler("failed")
                log_handler.log(file_path)

cookie = extract_cookie(Config().session_file)
if cookie:
    print("Cookie extracted successfully:", cookie)
    folder_path = "c:/users/owner/downloads/listing/libgen"
    upload_all_files_in_folder(folder_path, cookie)
else:
    print("Cookie not found in the session file.")
