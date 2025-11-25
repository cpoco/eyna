import module from "node:module"
import path from "node:path"

import { install } from "@eyna/lib/scripts/_vcpkg.ts"
import { headers } from "./_headers.ts"

const __top = path.join(import.meta.dirname ?? __dirname, "..")

const electron = module.createRequire(import.meta.url)(path.join(__top, "node_modules/electron/package.json"))

Promise.resolve()
	.then(() => {
		console.log(`\x1b[34mpostinstall headers node-${process.versions.node}\x1b[0m`)
		return headers("node", process.versions.node)
	})
	.then(() => {
		console.log(`\x1b[34mpostinstall headers electron-${electron.version}\x1b[0m`)
		return headers("electron", electron.version)
	})
	.then(() => {
		console.log(`\x1b[34mpostinstall vcpkg-install\x1b[0m`)
		return install("inherit")
	})
	.then(() => {
		console.log(`\x1b[34mpostinstall complete\x1b[0m`)
	})
	.catch((err) => {
		console.error(err)
		process.exit(1)
	})
