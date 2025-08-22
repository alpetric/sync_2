import * as wmill from "windmill-client"

type Enums = {
  [key: string]: string[]
}

type DefaultArgs = {
  [key: string]: any
}

type ResApproval = {
  enums?: Enums
  default_args?: DefaultArgs
}

/**
 * Sends an interactive approval request via Teams and optionally returns dynamic enums and default arguments.
 *
 * [Enterprise Edition Only] To include form fields in the slack approval request, go to Advanced -> Suspend -> Form and define a form
 * Learn more at https://www.windmill.dev/docs/flows/flow_approval#form
 * 
 * @param {string} teamName - Microsoft Teams "Team" Name.
 * @param {string} channelName - Teams Channel Name
 * @param {string} [message] - Optional custom message to include in the Teams approval request.
 * @param {string} [approver] - Optional user ID or name of the approver for the request.
 * @param {DefaultArgs} [defaultArgsJson] - Optional object defining or overriding the default arguments to a form field.
 * @param {Enums} [dynamicEnumsJson] - Optional object overriding the enum default values of an emum form field .
 * 
 * @throws {Error} If the `wmill.requestInteractiveTeamsApproval` call fails.
 * 
 * Example inputs:
 *   teamName: "Windmill",
 *   channelName: "General", 
 *   message: "Please approve this request",
 *   approver: "approver123",
 *   defaultArgsJson: { foo: ["choice1", "choice2"], bar: ["optionA", "optionB"] },
 *   dynamicEnumsJson: { key1: "value1", key2: 42 }
 * );
 */
export async function main(
  teamName: string,
  channelName: string,
  message?: string,
  approver?: string,
  defaultArgsJson?: DefaultArgs,
  dynamicEnumsJson?: Enums,
) {
  await wmill.requestInteractiveTeamsApproval({
    teamName,
    channelName,
    message,
    approver,
    defaultArgsJson,
    dynamicEnumsJson,
  });

  const returnObject: ResApproval = {}
  
  if (dynamicEnumsJson) returnObject.enums = dynamicEnumsJson
  if (defaultArgsJson) returnObject.default_args = defaultArgsJson

  return returnObject
}
