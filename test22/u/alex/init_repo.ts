//nobundling

export async function main(
  workspace_id: string,
  repo_url_resource_path: string,
  dry_run: boolean,
  only_wmill_yaml: boolean = false,
  pull: boolean = false,
  settings_json?: string, // JSON settings from UI for new CLI approach
  use_promotion_overrides?: boolean // Use promotionOverrides from repo branch when "use separate branch" toggle is selected
) {
  console.log("Sleeping for 90 seconds...");
  await new Promise(resolve => setTimeout(resolve, 90000));
  console.log("Sleep completed.");
  
  return { success: true, message: "Slept for 90 seconds" };
}
