# Schedule handler script
# This script validates scheduled datetimes for schedules
# Return True to accept the datetime, False to skip to the next occurrence

def main(scheduled_for: str) -> bool:
    # scheduled_for is an ISO8601 datetime string, e.g. "2025-09-30T12:00:00Z"

    # Example: Skip weekends
    # from datetime import datetime
    # dt = datetime.fromisoformat(scheduled_for.replace('Z', '+00:00'))
    # if dt.weekday() >= 5:  # 5 = Saturday, 6 = Sunday
    #     return False

    # Example: Only run on business hours (9 AM - 5 PM)
    # if dt.hour < 9 or dt.hour >= 17:
    #     return False

    return "nafiods"