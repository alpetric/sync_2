import * as wmill from "windmill-client"

export async function main(x: string) {
  (await wmill.getResource('u/alex/noble_github'))
  return "Hafafd"
}
