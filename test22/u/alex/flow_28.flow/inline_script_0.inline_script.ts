interface Output {
  command: string;
  input: string;
}

export async function main(text_input: string): Promise<Output> {
  const tokenized: string[] = text_input?.split(' ') || [];
  const command = tokenized[0] || 'help';
  const input = tokenized.slice(1,).join(' ');

  return { command, input };
}