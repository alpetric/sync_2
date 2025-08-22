export async function main(){
  return {
    wm_email: process.env["WM_EMAIL"],
    wm_username: process.env["WM_USERNAME"],
    wm_permissioned_as: process.env["WM_PERMISSIONED_AS"]
  }
}