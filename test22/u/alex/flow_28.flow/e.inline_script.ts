import * as wmill from "windmill-client"

export async function main(
  activity_id: string,
) {
  await wmill.TeamsService.sendMessageToConversation(
    {
      requestBody: {
        conversation_id: activity_id,
        success: true,
        text: getHelp()
      }
    }
  )
}

function getHelp() {
  const help = `Supported commands
  help - prints this command
  echo - prints input
  `;
  return help;
}
