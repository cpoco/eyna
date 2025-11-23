import module from "node:module"
import path from "node:path"

import { install } from "@eyna/lib/scripts/_vcpkg.ts"
import { headers } from "./_headers.ts"

const __top = path.join(import.meta.dirname ?? __dirname, "..")

const electron = module.createRequire(import.meta.url)(path.join(__top, "node_modules/electron/package.json"))

headers("node", process.versions.node)
headers("electron", electron.version)
install()
