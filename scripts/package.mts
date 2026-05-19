import fs from "node:fs"
import path from "node:path"

import * as el from "./_electron.mts"
import * as pk from "./_package.mts"

import electron from "../node_modules/electron/package.json" with { type: "json" }

const __top = path.join(import.meta.dirname, "..")

console.log(`package (${process.arch})\n`)

try {
	await fs.promises.rm(path.join(__top, "dist"), { recursive: true, force: true })
	await el.Download(electron.version)
	await pk.Package()
}
catch (err) {
	console.error(err)
	process.exit(1)
}
