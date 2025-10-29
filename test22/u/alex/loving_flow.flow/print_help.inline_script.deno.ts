export async function main(response_url: string, command: string) {
  const help = `Supported commands
  help - prints this command
  echo - prints input
  `;
  
  // For @mentions, we can't use response_url (it's empty)
  // The actual response should be handled by the echo command step
  if (command === '@mention') {
    // For @mentions, just return the help text
    // The handler will need to send it via Slack API
    return { help_text: help };
  }
  
  // For slash commands, use response_url
  await fetch(response_url, {
    method: 'POST',
    body: JSON.stringify({ text: help }),
  });
}
