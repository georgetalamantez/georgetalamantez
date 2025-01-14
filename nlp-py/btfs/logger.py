import os
from config import Config

class LogHandler:
    def log(self, message):
        pass

class UploadLogHandler(LogHandler):
    def log(self, message):
        with open(Config().log_file, 'a') as log:
            log.write(f"{message}\n")

class FailedLogHandler(LogHandler):
    def log(self, message):
        with open(Config().failed_log_file, 'a') as log:
            log.write(f"{message}\n")

def get_log_handler(handler_type="upload"):
    handlers = dict(upload=UploadLogHandler(), failed=FailedLogHandler())
    return handlers[handler_type]

def load_logged_files(log_file):
    if os.path.exists(log_file):
        with open(log_file, 'r') as log:
            return set(log.read().splitlines())
    return set()

def remove_from_failed_log(file_path):
    if os.path.exists(Config().failed_log_file):
        with open(Config().failed_log_file, 'r') as log:
            lines = log.readlines()
        with open(Config().failed_log_file, 'w') as log:
            log.writelines(line for line in lines if line.strip() != file_path)
