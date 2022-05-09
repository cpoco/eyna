import * as app from "./build/app.mjs"
import * as extension from "./build/extension.mjs"
import * as native from "./build/native.mjs"
import * as pug from "./build/pug.mjs"
import * as stylus from "./build/stylus.mjs"

await app.Init()
app.Check()
app.Build()
extension.Build()
native.Build()
pug.Build()
stylus.Build()
