import dayjs from 'dayjs'
import * as wmill from "windmill-client"

function formatError(error: any) {
  if (error.stack && error.name && error.message) {
    return `*${error.name}: ${error.message}*\`\`\`\n${error.stack}\n\`\`\``;
  } else {
    return `\`\`\`\n${JSON.stringify(error, null, 2)}\n\`\`\``;
  }
}

export async function main(
  path: string, // The path of the script or flow that errored
  is_flow: boolean, // Whether the runnable is a flow
  schedule_path: string, // The path of the schedule
  error: object, // The error details
  error_started_at: string, // The start datetime of the latest job that failed
  success_times: number, // The number of times the schedule succeeded before calling the recovery handler.
  success_result: object, // The result of the latest successful job
  success_started_at: string, // The start datetime of the latest successful job
  channel: string,
) {
  const baseUrl = process.env["WM_BASE_URL"];
  const scheduleUrl = baseUrl + "/runs?schedule_path=" +
    encodeURIComponent(schedule_path);
  const runnableUrl = baseUrl + (is_flow ? "/flows/get/" : "/scripts/get/") +
    path;

  const mdText = `*Schedule [${schedule_path}](${scheduleUrl}) recovered*${success_times > 1 ? (" " + success_times + " times in a row") : ""
    }:\n- ${is_flow ? "Flow" : "Script"}: [${path}](${runnableUrl})`

  const lastFailureText = `Last failure at: ${dayjs(error_started_at).format("DD.MM.YYYY HH:mm (Z)")}`
  const lastSuccessText = `Last success at: ${dayjs(success_started_at).format("DD.MM.YYYY HH:mm (Z)")}`

  console.log(lastSuccessText)
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
                    "text": "Schedule Recovery Handler"
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
                          },
                          {
                            "type": "TextBlock",
                            "text": lastFailureText,
                            "wrap": true
                          },
                          {
                            "type": "CodeBlock",
                            "codeSnippet": formatError(error),
                            "language": "JavaScript"
                          },
                          {
                            "type": "TextBlock",
                            "text": lastSuccessText,
                            "wrap": true
                          },
                          {
                            "type": "CodeBlock",
                            "codeSnippet": success_result,
                            "language": "JavaScript"
                          },
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
