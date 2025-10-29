import { WebClient } from "https://deno.land/x/slack_web_api@1.0.3/mod.ts";

export async function main(
  response_url: string,
  command: string,
  slack: { token: string },
  channel_id?: string
) {
  const help = `Supported commands
  help - prints this command
  echo - prints input
  `;
  
  // Check if triggered by @mention or slash command
  if (command === '@mention') {
    // For @mentions, use Slack API to respond
    const web = new WebClient(slack.token);
    await web.chat.postMessage({
      channel: channel_id,
      text: help,
    });
  } else {
    // For slash commands, use response_url
    await fetch(response_url, {
      method: 'POST',
      body: JSON.stringify({ text: help }),
    });
  }
}
