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
 * Sends an interactive approval request via Slack and optionally returns dynamic enums and default arguments.
 *
 * [Enterprise Edition Only] To include form fields in the slack approval request, go to Advanced -> Suspend -> Form and define a form
 * Learn more at https://www.windmill.dev/docs/flows/flow_approval#form
 * 
 * @param {string} slackResourcePath - The path to the Slack resource in Windmill.
 * @param {string} channelId - The Slack channel ID where the approval request will be sent.
 * @param {string} [message] - Optional custom message to include in the Slack approval request.
 * @param {string} [approver] - Optional user ID or name of the approver for the request.
 * @param {DefaultArgs} [defaultArgsJson] - Optional object defining or overriding the default arguments to a form field.
 * @param {Enums} [dynamicEnumsJson] - Optional object overriding the enum default values of an emum form field .
 * 
 * @throws {Error} If the `wmill.requestInteractiveSlackApproval` call fails.
 * 
 * Example inputs:
 *   slackResourcePath: "/u/alex/my_slack_resource",
 *   "admins-slack-channel", 
 *   "Please approve this request",
 *   "approver123",
 *   { foo: ["choice1", "choice2"], bar: ["optionA", "optionB"] },
 *   { key1: "value1", key2: 42 }
 * );
 */
export async function main(
  slackResourcePath: string,
  channelId: string,
  message?: string,
  approver?: string,
  defaultArgsJson?: DefaultArgs,
  dynamicEnumsJson?: Enums,
) {
  await wmill.requestInteractiveSlackApproval({
    slackResourcePath,
    channelId,
    message,
    approver,
    defaultArgsJson,
    dynamicEnumsJson,
  })

  const returnObject: ResApproval = {}

  if (dynamicEnumsJson) returnObject.enums = dynamicEnumsJson
  if (defaultArgsJson) returnObject.default_args = defaultArgsJson

  return returnObject
}

