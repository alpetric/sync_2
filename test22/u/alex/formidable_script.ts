import * as wmill from "windmill-client"

export async function main(
  activity_id: string,
  command: string,
  from_name: string,
  team_id: string,
  teams_message: any
) {
  // Your business logic
  const res = "task completed successfully!"

  // (optional) Send update to Teams channel about completion of job
  await wmill.TeamsService.sendMessageToConversation(
    {
      requestBody: {
        conversation_id: activity_id,
        success: true,
        text: `Hi, ${from_name}, command: ${command} ran successfully with the following result: ${res}`
      }
    }
  )
}