// export async function main(
//     raw_email: string,
//     parsed_email: any,
//     email_arg_test?: string,
//     email_arg_test2?: string,
//     ...otherArgs: any[]
//   ) {
//     // Standard email processing
//     console.log("Raw email:", raw_email);
//     console.log("Parsed email:", parsed_email);

//     // Extra args from your email address
//     console.log("Extra args from email:");
//     console.log("email_arg_test:", email_arg_test);
//     console.log("email_arg_test2:", email_arg_test2);

//     // Or access all arguments dynamically
//     const allArgs = arguments;
//     for (let i = 2; i < allArgs.length; i++) {
//       const argName = `arg_${i-2}`;
//       console.log(`${argName}:`, allArgs[i]);
//     }

//     return {
//       message: "Script executed with email args",
//       extraArgs: { email_arg_test, email_arg_test2 }
//     };
//   }

export async function main(raw_email, parsed_email, email_arg_test, email_arg_Test2) {
  console.log(email_arg_test)
  console.log(email_arg_test2)
}