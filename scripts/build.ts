import * as app from "./_app.ts"
import * as extension from "./_extension.ts"
import * as native from "./_native.ts"
import * as pug from "./_pug.ts"
import * as stylus from "./_stylus.ts"

console.log(`build (${process.arch})\n`)

app.Node()
app.Conf()
app.Check()
app.Build()
extension.Check()
extension.Build()
native.Build()
pug.Build()
stylus.Build()
