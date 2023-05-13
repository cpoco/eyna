import * as pk from "./_package.mjs"

const arch = process.argv?.[2] == "arm64" ? "arm64" : "x64"
console.log(`package (${arch})\n`)

pk.Package(arch)
