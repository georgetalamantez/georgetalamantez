import tempfile
import shutil

# Clean temp directory
temp_dir = tempfile.gettempdir()
shutil.rmtree(temp_dir)
print(f"Cleaned temporary directory: {temp_dir}")
