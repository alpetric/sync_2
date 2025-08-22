import wmill from "windmill-cli@1.510.0";

export async function main() {
  console.log("start")
  return wmill.showVersion()
}
