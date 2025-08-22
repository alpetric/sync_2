import * as wmill from "windmill-client@^1.158.2"

export async function main(approver?: string) {
  const urls = await wmill.getResumeUrls(approver)
  // send the urls to their intended recipients
  console.log(urls)
  return {
    // if the resumeUrls are part of the response, they will be available to any persons having access
    // to the run page and allowed to be approved from there, even from non owners of the flow
    // self-approval is disableable in the suspend options
    ...urls,

    // to have prompts (self-approvable steps), clude instead the resume url in the returned payload of the step
    // the UX will automatically adapt and show the prompt to the operator when running the flow. e.g:
    // resume: urls['resume'],

    default_args: {},
    enums: {},
    description: undefined
    // supports all formats from rich display rendering such as simple strings,
    // but also markdown, html, images, tables, maps, render_all, etc...
    // https://www.windmill.dev/docs/core_concepts/rich_display_rendering
  }
}

// add a form in Advanced - Suspend
// all on approval steps: https://www.windmill.dev/docs/flows/flow_approval