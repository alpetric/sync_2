import dayjs from 'dayjs'
import * as wmill from "windmill-client"

export async function main(
  path: string, // The path of the script or flow
  is_flow: boolean, // Whether the runnable is a flow
  schedule_path: string, // The path of the schedule
  success_result: object, // The result of the latest successful job
  success_started_at: string, // The start datetime of the latest successful job
  channel: string,
) {
  const baseUrl = process.env["WM_BASE_URL"];
  const scheduleUrl = baseUrl + "/runs?schedule_path=" +
    encodeURIComponent(schedule_path);
  const runnableUrl = baseUrl + (is_flow ? "/flows/get/" : "/scripts/get/") + path;

  let mdText = `*Schedule [${schedule_path}](${scheduleUrl}) was successful*:\n- ${is_flow ? "Flow" : "Script"}: [${path}](${runnableUrl})`

  const lastFailureText = `Last failure at: ${dayjs(success_started_at).format("DD.MM.YYYY HH:mm (Z)")}\n`

  await wmill.TeamsService.sendMessageToConversation(
    {
      requestBody: {
        conversation_id: channel,
        success: true,
        text: mdText,
        card_block: {
          "type": "message",
          "attachments": [
            {
              "contentType": "application/vnd.microsoft.card.adaptive",
              "content": {
                "type": "AdaptiveCard",
                "body": [
                  {
                    "type": "TextBlock",
                    "size": "Medium",
                    "weight": "Bolder",
                    "text": "Success Handler"
                  },
                  {
                    "type": "ColumnSet",
                    "columns": [
                      {
                        "type": "Column",
                        "items": [
                          {
                            "type": "Icon",
                            "name": "ServerPlay",
                            "size": "Medium",
                            "style": "Filled",
                            "color": "Good"
                          }
                        ],
                        "width": "auto"
                      },
                      {
                        "type": "Column",
                        "items": [
                          {
                            "type": "TextBlock",
                            "text": mdText,
                            "wrap": true
                          }
                        ],
                        "width": "stretch"
                      }
                    ]
                  }
                ],
                "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
                "version": "1.6"
              },
            }
          ]
        }
      }
    }
  )
}