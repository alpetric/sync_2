export async function main(
  response_url: string,
  text: string,
) {
  const x = await fetch(response_url, {
    method: 'POST',
    body: JSON.stringify({ text: `ROGER ${text}` }),
  });
}