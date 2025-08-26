 export async function main(raw_email: string, parsed_email: any, ...extraArgs: any[]) {
    console.log("Raw email:", raw_email);
    console.log("Parsed email:", parsed_email);
    console.log("Extra args:", extraArgs);

    return {
      raw_email_length: raw_email.length,
      parsed_subject: parsed_email.headers?.Subject,
      extra_args_count: extraArgs.length
    };
  }