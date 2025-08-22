import wmill


def main():
    card = {
        "type": "message",
        "attachments": [
            {
                "contentType": "application/vnd.microsoft.card.adaptive",
                "content": {
                    "type": "AdaptiveCard",
                    "$schema": "https://adaptivecards.io/schemas/adaptive-card.json",
                    "version": "1.6",
                    "body": [
                        {
                            "type": "TextBlock",
                            "text": "This is a Text Box",
                            "wrap": true,
                        }
                    ],
                },
            }
        ],
        "conversation": {"id": "YOUR_CONVERSATION_ID"},
    }

    wmill.send_teams_message(
        "19:49d9a024000e42f0877c599e84e49458@thread.tacv2", "Test Card", True, card
    )
