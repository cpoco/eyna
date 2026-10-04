import fs from "node:fs"
import path from "node:path"

import * as app from "./_app.mts"
import * as extension from "./_extension.mts"

const __top = path.join(import.meta.dirname, "..")

console.log(`build (${process.arch})\n`)

try {
	await Promise.all([
		app.Check(),
		extension.Check(),
	])
}
catch (err) {
	console.error(err)
	process.exit(1)
}
