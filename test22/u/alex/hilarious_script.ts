 export async function main(raw_email: string, parsed_email: any, ...extraArgs: any[]) {
    console.log("Raw email:", raw_email);
    console.log("Parsed email:", parsed_email);
    console.log("Extra args:", extraArgs);

    // The extra args will be passed in the order they were parsed
    // You can also access them from the Windmill job context if available

    return {
      raw_email_length: raw_email.length,
      parsed_subject: parsed_email.headers?.Subject,
      extra_args_count: extraArgs.length
    };
  }