import * as pk from "./_package.mjs"

const arch = process.argv?.[2] ?? process.arch
console.log(`package (${arch})\n`)

pk.Package(arch)
