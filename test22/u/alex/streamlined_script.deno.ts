  export async function main(
      response_url: string,  // Will be empty string "" for @mentions
      text: string,          // Message text with @mention stripped
      channel_id?: string,   // Channel ID
      user_id?: string,      // Slack user ID
      command?: string,      // Will be "@mention" for @mentions, "/windmill" for slash commands
      event_id?: string,     // Unique event ID (only for @mentions)
      ts?: string,           // Message timestamp (only for @mentions)
      thread_ts?: string     // Thread timestamp if in thread (only for @mentions)
  ) {
      // Your handler logic

      // Check if it's an @mention
      if (command === "@mention") {
          // Handle @mention - can't use response_url, use Slack API instead
          console.log("Triggered by @mention");
      } else {
          // Handle /windmill command
          console.log("Triggered by slash command");
      }
  }