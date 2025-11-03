// import * as wmill from "windmill-client"
import wmill from "windmill-cli@1.534.0";

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
