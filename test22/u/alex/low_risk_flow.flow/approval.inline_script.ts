//nobundling
import * as wmill from "windmill-client"

export async function main(approver?: string) {
  await wmill.requestInteractiveTeamsApproval({
      teamName: "Windmill",
      channelName: "General",
      message: "Please approve this request",
      approver: "approver123",
      defaultArgsJson: { key1: "value1", key2: 42 },
      dynamicEnumsJson: { foo: ["choice1", "choice2"], bar: ["optionA", "optionB"] },
  });
}
