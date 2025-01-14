from logger import get_log_handler

def log_action(log_handler):
    def decorator(fn):
        def wrapped(*args, **kwargs):
            result = fn(*args, **kwargs)
            log_handler.log(f"Action {fn.__name__} with args {args}, kwargs {kwargs}, result {result}")
            return result
        return wrapped
    return decorator
