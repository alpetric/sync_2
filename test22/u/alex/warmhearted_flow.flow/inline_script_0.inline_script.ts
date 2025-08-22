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

export async function main(
  teamName: string,
  channelName: string,
  message?: string,
  approver?: string,
  defaultArgsJson?: DefaultArgs,
  dynamicEnumsJson?: Enums,
) {
  await wmill.requestInteractiveSlackApproval({
    teamName,
    channelName,
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