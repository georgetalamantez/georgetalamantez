import requests
import os

# Path to your downloaded certificate
cert_path = "c:/users/owner/downloads/btfs.io.crt"

# Test URL (replace with your actual API endpoint)
url = "https://finder.btfs.io/api/v1/gateway/upload_file"

# Verify the certificate is being used
try:
    response = requests.get(url, verify=cert_path)
    if response.status_code == 200:
        print("Connection successful using the custom certificate!")
        print("Response:", response.text)
    else:
        print(f"Failed to connect: {response.status_code}")
        print("Response:", response.text)
except requests.exceptions.SSLError as ssl_err:
    print("SSL error:", ssl_err)
except Exception as e:
    print("An error occurred:", e)
