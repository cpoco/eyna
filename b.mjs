import * as app from "./build/app.mjs"
import * as extension from "./build/extension.mjs"
import * as native from "./build/native.mjs"
import * as pug from "./build/pug.mjs"
import * as stylus from "./build/stylus.mjs"

const arch = process.argv?.[2] == "arm64" ? "arm64" : "x64"
console.log(`build (${arch})`)

await app.Init()
app.Check()
app.Build()
extension.Check()
extension.Build()
native.Build(arch)
pug.Build()
stylus.Build()
