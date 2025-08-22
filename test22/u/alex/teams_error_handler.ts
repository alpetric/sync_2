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
  workspace_id: string,
  job_id: string, // The UUID of the job that errored
  path: string, // The path of the script or flow that errored
  is_flow: boolean, // Whether the runnable is a flow
  schedule_path: string, // The path of the schedule
  error: object, // The error details
  started_at: string, // The start datetime of the latest job that failed
  failed_times: number, // Minimum number of times the schedule failed before calling the error handler
  channel: string,
) {
  const baseUrl = process.env["WM_BASE_URL"];
  const scheduleUrl = baseUrl + "/runs?schedule_path=" +
    encodeURIComponent(schedule_path) + "&workspace=" + encodeURIComponent(workspace_id);
  const scriptOrFlowRunUrl = baseUrl + (is_flow ? "/flows/get/" : "/scripts/get/") +
    path + "?workspace=" + encodeURIComponent(workspace_id);
  const jobRunUrl = baseUrl + "/run/" + job_id + "?workspace=" + encodeURIComponent(workspace_id);

  let mdText = ""
  if (schedule_path === undefined) {
    mdText = `*Run [${job_id}](${jobRunUrl}) of ${is_flow ? "flow" : "script"} [${path}](${scriptOrFlowRunUrl}) failed*${failed_times > 1 ? (" " + failed_times + " times in a row") : ""}:`
  } else {
    mdText = `*Schedule [${schedule_path}](${scheduleUrl}) failed*${failed_times > 1 ? (" " + failed_times + " times in a row") : ""}:\n- Run [${job_id}](${jobRunUrl}) of ${is_flow ? "flow" : "script"}: [${path}](${scriptOrFlowRunUrl})`
  }

  const lastFailureText = `Last failure at: ${dayjs(started_at).format("DD.MM.YYYY HH:mm (Z)")}\n`

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
                    "text": "Error Handler"
                  },
                  {
                    "type": "ColumnSet",
                    "columns": [
                      {
                        "type": "Column",
                        "items": [
                          {
                            "type": "Icon",
                            "name": "Warning",
                            "size": "Medium",
                            "style": "Filled",
                            "color": "Attention"
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