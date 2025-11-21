import module from "node:module"
import path from "node:path"

import * as h from "./_headers.ts"

const __top = path.join(import.meta.dirname ?? __dirname, "..")

const electron = module.createRequire(import.meta.url)(path.join(__top, "node_modules/electron/package.json"))

h.headers("node", process.versions.node)
h.headers("electron", electron.version)
