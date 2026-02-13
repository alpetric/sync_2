import * as wmill from "windmill-client"

// Windmill Teams Bot required in OAuth Instance Settings
// conversation_id: e.g "19:49d9a024000e42f0877c599e84e49458@thread.tacv2"
export async function main(conversation_id: string, approver?: string) {
  const endpoints = await wmill.getResumeUrls(approver);

  // Modify as required:
  // https://adaptivecards.microsoft.com/designer
  const card_block = {
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
                            "text": "Workflow Suspended",
                            "size": "Large",
                            "weight": "Bolder",
                            "wrap": true
                        },
                        {
                            "type": "TextBlock",
                            "text": "A workflow has been suspended and is waiting for approval!",
                            "wrap": true,
                        },
                        {
                          "type": "ActionSet",
                          "actions": [
                              {
                                  "type": "Action.OpenUrl",
                                  "title": "Resume or Cancel",
                                  "url": `${endpoints.approvalPage}`
                              }
                          ]
                        }
                    ],
                },
            }
        ],
        "conversation": {"id": `${conversation_id}`},
    }

  await wmill.TeamsService.sendMessageToConversation({requestBody: { conversation_id, text: "A workflow has been suspended and is waiting for approval!", card_block }})
}