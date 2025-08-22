import * as wmill from "windmill-client";
import { basename } from "node:path"
const util = require('util');
const exec = util.promisify(require('child_process').exec);


export async function main(repo_url_resource_path: string) {
  const cwd = process.cwd();
  process.env["HOME"] = ".";
  console.log(`Cloning repo from resource`);
  const repo_name = await git_clone(repo_url_resource_path);
  process.chdir(`${cwd}/${repo_name}`);
  console.log(`Attempting an empty push to repository ${repo_name}`);
  await git_push();
  console.log("Finished");
  process.chdir(`${cwd}`);
}

async function git_clone(repo_resource_path: string): Promise<string> {
  // TODO: handle private SSH keys as well

  const repo_resource = await wmill.getResource(repo_resource_path);

  let repo_url = repo_resource.url

  if (repo_resource.is_github_app) {
    const token = await get_gh_app_token()
    const authRepoUrl = prependTokenToGitHubUrl(repo_resource.url, token);
    repo_url = authRepoUrl;
  }

  const azureMatch = repo_url.match(/AZURE_DEVOPS_TOKEN\((?<url>.+)\)/);
  if (azureMatch) {
    console.log(
      "Requires Azure DevOps service account access token, requesting..."
    );
    const azureResource = await wmill.getResource(azureMatch.groups.url);
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
  const repo_name = basename(repo_url, ".git");
  await sh_run(4, "git", "clone", "--quiet", "--depth", "1", repo_url, repo_name);
  return repo_name;
}
async function git_push() {
  await sh_run(undefined, "git", "config", "user.email", process.env["WM_EMAIL"])
  await sh_run(undefined, "git", "config", "user.name", process.env["WM_USERNAME"])
  await sh_run(undefined, "git", "push");
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
  let secret: string | undefined = undefined;
  if (secret_position != undefined) {
    nargs[secret_position] = "***";
    secret = args[secret_position];
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

async function get_gh_app_token() {
  const workspace = process.env["WM_WORKSPACE"];
  const jobToken = process.env["WM_TOKEN"];

  const baseUrl =
    process.env["BASE_INTERNAL_URL"] ??
    process.env["BASE_URL"] ??
    "http://localhost:8000";

  const url = `${baseUrl}/api/w/${workspace}/github_app/token`;

  console.log(url)
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jobToken}`,
    },
    body: JSON.stringify({
      job_token: jobToken,
    }),
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.statusText}`);
  }

  const data = await response.json();

  return data.token;
}

function prependTokenToGitHubUrl(gitHubUrl: string, installationToken: string) {
  if (!gitHubUrl || !installationToken) {
    throw new Error("Both GitHub URL and Installation Token are required.");
  }

  try {
    const url = new URL(gitHubUrl);

    // GitHub repository URL should be in the format: https://github.com/owner/repo.git
    if (url.hostname !== "github.com") {
      throw new Error("Invalid GitHub URL. Must be in the format 'https://github.com/owner/repo.git'.");
    }

    // Convert URL to include the installation token
    return `https://x-access-token:${installationToken}@github.com${url.pathname}`;
  } catch (e) {
    const error = e as Error
    throw new Error(`Invalid URL: ${error.message}`)
  }
}