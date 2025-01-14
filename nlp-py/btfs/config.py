class Config:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(Config, cls).__new__(cls, *args, **kwargs)
            cls._instance.session_file = "c:/users/owner/downloads/request_session.txt"
            cls._instance.log_file = "c:/users/owner/downloads/upload_log.txt"
            cls._instance.failed_log_file = "c:/users/owner/downloads/failed_uploads.txt"
        return cls._instance
