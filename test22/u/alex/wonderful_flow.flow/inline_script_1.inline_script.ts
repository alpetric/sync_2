// import * as wmill from "windmill-client"

export async function main(x: boolean) {
  console.log(x)
  return x ? "foo" : "bar"
}
