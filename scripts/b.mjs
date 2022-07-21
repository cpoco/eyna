import * as app from "./_app.mjs"
import * as extension from "./_extension.mjs"
import * as native from "./_native.mjs"
import * as pug from "./_pug.mjs"
import * as stylus from "./_stylus.mjs"

const arch = process.argv?.[2] == "arm64" ? "arm64" : "x64"
console.log(`build (${arch})`)

app.Node()
app.Conf()
app.Check()
app.Build()
extension.Check()
extension.Build()
native.Build(arch)
pug.Build()
stylus.Build()
