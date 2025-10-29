
  import { WebClient } from 'https://deno.land/x/slack_web_api@1.0.0/mod.ts';

  export async function main(
      response_url: string,
      text: string,
      channel_id?: string,
      command?: string,
      slack_resource?: any  // Your Slack resource
  ) {
      if (command === "@mention") {
          // Use Slack API for @mentions
          const web = new WebClient(slack_resource.token);
          await web.chat.postMessage({
              channel: channel_id,
              text: `I received: ${text}`
          });
      } else {
          // Use response_url for slash commands
          await fetch(response_url, {
              method: 'POST',
              body: JSON.stringify({ text: `I received: ${text}` })
          });
      }
  }