import * as wmill from "windmill-client"
        
export async function main() {
    const urls = await wmill.getResumeUrls("approver1")

    return {
        resume: urls['resume'],
        cancel: urls['cancel'],
        default_args: {}, // optional, see below
        enums: {} // optional, see below
    }
}