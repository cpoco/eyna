import * as native from "./_native.mjs"

const arch = process.argv?.[2] == "arm64" ? "arm64" : "x64"
console.log(`build (${arch})`)

native.Build(arch, false)
