import * as wmillclient from "windmill-client";
import wmill from "windmill-cli";
import { basename } from "node:path"
const util = require('util');
const exec = util.promisify(require('child_process').exec);
import process from "process";

export async function main(
  payload: string,
  skip_secret: boolean = false,
  skip_variables: boolean = false,
  skip_resources: boolean = false,
  include_schedules: boolean = false,
  include_users: boolean = false,
  include_groups: boolean = false,
  include_settings: boolean = false,
  include_key: boolean = false,
  extra_includes: string = '',
  excludes: string = '',
  message: string = '',
  repo_resource_path?: string
) {
  const ws = process.env["WM_WORKSPACE"]
  const gh_payload = JSON.parse(payload)
  const gh_repo = gh_payload.repository?.full_name

  console.log("Received git sync push request:")
  console.log(`Repo: ${gh_repo}`)
  console.log(`Ref: ${gh_payload.ref}`)
  console.log(`Pusher: ${gh_payload.pusher.name}`)

  // If repo_resource_path is provided, use it directly
  if (repo_resource_path) {
    console.log("Using provided repo resource path:", repo_resource_path)
    const repo_resource = await wmillclient.getResource(repo_resource_path.replace("$res:", ""))
    const cwd = process.cwd()
    process.env["HOME"] = "."

    await git_clone(cwd, repo_resource, true)

    await wmill_sync_push(
      ws!,
      skip_secret,
      skip_variables,
      skip_resources,
      include_schedules,
      include_users,
      include_groups,
      include_settings,
      include_key,
      extra_includes,
      excludes,
      message
    )
    console.log("Finished syncing")
    process.chdir(`${cwd}`)
    return { success: true }
  }

  // URL matching logic
  const ws_settings = await wmillclient.WorkspaceService.getSettings({ workspace: ws });
  const repos = ws_settings.git_sync?.repositories

  if (repos && repos.length > 0) {
    for (const repo of repos) {
      const repo_resource = await wmillclient.getResource(repo.git_repo_resource_path.split("$res:").pop());
      if (repo_resource.url?.includes(gh_repo)) {
        console.log("Repo found...")
        const cwd = process.cwd();
        process.env["HOME"] = "."

        await git_clone(cwd, repo_resource, true);

        await wmill_sync_push(
          ws!,
          skip_secret,
          skip_variables,
          skip_resources,
          include_schedules,
          include_users,
          include_groups,
          include_settings,
          include_key,
          extra_includes,
          excludes,
          message
        )
        console.log("Finished syncing");
        process.chdir(`${cwd}`);
        return { success: true }
      }
    }
  }
}

async function git_clone(
  cwd: string,
  repo_resource: any,
  use_individual_branch: boolean
): Promise<string> {
  let repo_url = repo_resource.url;
  const subfolder = repo_resource.folder ?? "";
  const branch = repo_resource.branch ?? "";
  const repo_name = basename(repo_url, ".git");
  const azureMatch = repo_url.match(/AZURE_DEVOPS_TOKEN\((?<url>.+)\)/);
  if (azureMatch) {
    console.log(
      "Requires Azure DevOps service account access token, requesting..."
    );
    const azureResource = await wmillclient.getResource(azureMatch.groups.url);
    const response = await fetch(
      `https://login.microsoftonline.com/${azureResource.azureTenantId}/oauth2/token`,
      {
        method: "POST",
        body: new URLSearchParams({
          client_id: azureResource.azureClientId,
          client_secret: azureResource.azureClientSecret,
          grant_type: "client_credentials",
          resource: "499b84ac-1321-427f-aa17-267ca6975798/.default",
        }),
      }
    );
    const { access_token } = await response.json();
    repo_url = repo_url.replace(azureMatch[0], access_token);
  }
  const args = ["clone", "--quiet", "--depth", "1"];
  if (use_individual_branch) {
    args.push("--no-single-branch"); // needed in case the asset branch already exists in the repo
  }
  if (subfolder !== "") {
    args.push("--sparse");
  }
  if (branch !== "") {
    args.push("--branch");
    args.push(branch);
  }
  args.push(repo_url);
  args.push(repo_name);
  await sh_run(-1, "git", ...args);
  try {
    process.chdir(`${cwd}/${repo_name}`);
  } catch (err) {
    console.log(
      `Error changing directory to '${cwd}/${repo_name}'. Error was:\n${err}`
    );
    throw err;
  }
  process.chdir(`${cwd}/${repo_name}`);
  if (subfolder !== "") {
    await sh_run(undefined, "git", "sparse-checkout", "add", subfolder);
  }
  try {
    process.chdir(`${cwd}/${repo_name}/${subfolder}`);
  } catch (err) {
    console.log(
      `Error changing directory to '${cwd}/${repo_name}/${subfolder}'. Error was:\n${err}`
    );
    throw err;
  }
  return repo_name;
}

async function sh_run(
  secret_position: number | undefined,
  cmd: string,
  ...args: string[]
) {
  const nargs = secret_position != undefined ? args.slice() : args;
  if (secret_position && secret_position < 0) {
    secret_position = nargs.length - 1 + secret_position;
  }
  let secret: string | undefined = undefined
  if (secret_position != undefined) {
    nargs[secret_position] = "***";
    secret = args[secret_position]
  }

  console.log(`Running '${cmd} ${nargs.join(" ")} ...'`);
  const command = exec(`${cmd} ${args.join(" ")}`)
  try {
    const { stdout, stderr } = await command
    if (stdout.length > 0) {
      console.log(stdout);
    }
    if (stderr.length > 0) {
      console.log(stderr);
    }
    console.log("Command successfully executed");
    return stdout;

  } catch (error) {
    let errorString = error.toString();
    if (secret) {
      errorString = errorString.replace(secret, "***");
    }
    const err = `SH command '${cmd} ${nargs.join(
      " "
    )}' returned with error ${errorString}`;
    throw Error(err);
  }
}


async function wmill_sync_push(
  workspace_id: string,
  skip_secret: boolean,
  skip_variables: boolean,
  skip_resources: boolean,
  include_schedules: boolean,
  include_users: boolean,
  include_groups: boolean,
  include_settings: boolean,
  include_key: boolean,
  extra_includes: string,
  excludes: string,
  message: string,
) {
  console.log("Pushing workspace to windmill");
  await wmill_run(
    3,
    "sync",
    "push",
    "--token",
    process.env["WM_TOKEN"] ?? "",
    "--workspace",
    workspace_id,
    "--yes",
    skip_secret ? "--skip-secrets" : "",
    skip_variables ? "--skip-variables" : "",
    skip_resources ? "--skip-resources" : "",
    include_schedules ? "--include-schedules" : "",
    include_users ? "--include-users" : "",
    include_groups ? "--include-groups" : "",
    include_settings ? "--include-settings" : "",
    include_key ? "include-key" : "",
    "--base-url",
    process.env["BASE_URL"] + "/",
    extra_includes ? "--extra-includes" : "",
    extra_includes ? extra_includes : "",
    excludes ? "--excludes" : "",
    excludes ? excludes : "",
    message ? "--message" : "",
    message ? message : "",
  );
}

async function wmill_run(secret_position: number, ...cmd: string[]) {
  cmd = cmd.filter((elt) => elt !== "");
  const cmd2 = cmd.slice();
  cmd2[secret_position] = "***";
  console.log(`Running 'wmill ${cmd2.join(" ")} ...'`);
  await wmill.parse(cmd);
  console.log("Command successfully executed");
}

