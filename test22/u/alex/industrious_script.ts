// import * as wmill from "windmill-client"
import wmill from "windmill-cli";

export async function main() {
  await wmill.parse([
      "workspace",
      "add",
      "test",
      "test",
      process.env["BASE_URL"] + "/",
      "--token",
      process.env["WM_TOKEN"] ?? ""]
    );

}
