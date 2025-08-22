import * as wmillclient from "windmill-client";
import wmill from "windmill-cli";
import { basename, join } from "node:path";
import { existsSync } from "fs";
const util = require("util");
const exec = util.promisify(require("child_process").exec);
import process from "process";

export async function main() {
  console.log("start")
  return wmill.showVersion()
}
