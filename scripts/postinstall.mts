import module from "node:module"
import path from "node:path"

import { install } from "@eyna/lib/scripts/_vcpkg.mts"
import { headers } from "./_headers.mts"

const __top = path.join(import.meta.dirname, "..")

const electron = module.createRequire(import.meta.url)(path.join(__top, "node_modules/electron/package.json"))

try {
	console.log(`\x1b[34mpostinstall headers node-${process.versions.node}\x1b[0m`)
	await headers("node", process.versions.node)

	console.log(`\x1b[34mpostinstall headers electron-${electron.version}\x1b[0m`)
	await headers("electron", electron.version)

	console.log(`\x1b[34mpostinstall vcpkg-install\x1b[0m`)
	await install("inherit")

	console.log(`\x1b[34mpostinstall complete\x1b[0m`)
}
catch (err) {
	console.error(err)
	process.exit(1)
}
