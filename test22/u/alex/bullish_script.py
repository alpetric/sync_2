def main():
    return {
        "windmill_headers": {
            "Access-Control-Allow-Origin": "https://example.com",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization"
        },
        "result": {
            "message": "Hello from Windmill!",
            "timestamp": "2025-01-09"
        }
    }