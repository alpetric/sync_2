import pandas as pd
import requests

# This would cause a false split!
error_message = """
Please ensure you have defined man(username, password) correctly.
"""

CONFIG = {
    "api_url": "https://api.example.com"
}

def main(x: str):
    return x