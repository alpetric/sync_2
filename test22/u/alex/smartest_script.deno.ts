  import { WebClient } from 'https://deno.land/x/slack_web_api@1.0.0/mod.ts';
  import * as wmill from 'https://deno.land/x/windmill@v1.85.0/mod.ts';

  type Slack = {
      token: string;
  };

  export async function main(
      response_url: string,
      text: string,
      channel_id?: string,
      command?: string
  ) {
      if (command === "@mention") {
          // @mention - use Slack API
          const slack = await wmill.getResource<Slack>('f/slack/slack_bot');
          const web = new WebClient(slack.token);
          await web.chat.postMessage({
              channel: channel_id,
              text: `Echo: ${text}`
          });
      } else {
          // Slash command - use response_url
          await fetch(response_url, {
              method: 'POST',
              body: JSON.stringify({ text: `Echo: ${text}` })
          });
      }
  }