import os
import sys
import requests
import mimetypes
from pathlib import Path
from requests_toolbelt.multipart.encoder import MultipartEncoder

progress_counter = 0
progress_events = []

def read_folder(folderpath):
    """
    Reads all files recursively from the given folder path.
    Returns a list of file paths.
    """
    files = []
    for root, _, filenames in os.walk(folderpath):
        for filename in filenames:
            files.append(os.path.join(root, filename))
    return files

def base_path_converter(folderpath, filepath):
    """
    Converts an absolute file path into a relative path based on the folder path.
    """
    return os.path.relpath(filepath, folderpath)

def pin_folder_to_ipfs(username, password, folderpath):
    url = "https://www.storj-ipfs.com/api/v0/add?wrap-with-directory"

    files = read_folder(folderpath)
    
    multipart_data = MultipartEncoder(
        fields={
            f"file": (
                base_path_converter(folderpath, file),
                open(file, "rb"),
                mimetypes.guess_type(file)[0] or "application/octet-stream"
            ) for file in files
        }
    )

    headers = {
        "Authorization": f"Basic {requests.auth._basic_auth_str(username, password)}",
        "Content-Type": multipart_data.content_type,
    }

    with requests.post(url, headers=headers, data=multipart_data, stream=True) as response:
        for chunk in response.iter_content(chunk_size=8192):
            if chunk:
                global progress_counter
                progress_counter += 1
                progress_events.append(len(chunk))

                if progress_counter >= 25:
                    progress_counter = 0
                    print(f"Uploaded {sum(progress_events)} bytes")

        return response

def print_last_ten_progress_events():
    last_ten = progress_events[-10:]
    for event in last_ten:
        print(f"Uploaded chunk of size: {event} bytes")

def main():
    if len(sys.argv) != 4:
        print(f"Usage: python {sys.argv[0]} <username> <password> <folderpath>")
        sys.exit(1)

    username, password, folderpath = sys.argv[1:]

    if not os.path.exists(folderpath):
        print("Error: Specified folder path does not exist.")
        sys.exit(1)

    response = pin_folder_to_ipfs(username, password, folderpath)
    print(response.text)

    # Print the last 10 progress events
    print_last_ten_progress_events()

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)
