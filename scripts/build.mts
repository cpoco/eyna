import fs from "node:fs"
import path from "node:path"

import * as app from "./_app.mts"
import * as extension from "./_extension.mts"
import * as native from "./_native.mts"
import * as pug from "./_pug.mts"
import * as stylus from "./_stylus.mts"

const __top = path.join(import.meta.dirname, "..")

console.log(`build (${process.arch})\n`)

try {
	await fs.promises.rm(path.join(__top, "build"), { recursive: true, force: true })
	await Promise.all([
		fs.promises.mkdir(path.join(__top, "build", "app"), { recursive: true }),
		fs.promises.mkdir(path.join(__top, "build", "bin"), { recursive: true }),
		fs.promises.mkdir(path.join(__top, "build", "config"), { recursive: true }),
		fs.promises.mkdir(path.join(__top, "build", "extension"), { recursive: true }),
	])
	await Promise.all([
		app.Node(),
		app.Conf(),
		app.Check(),
		app.Build(),
		extension.Check(),
		extension.Build(),
		native.Build(),
		pug.Build(),
		stylus.Build(),
	])
}
catch (err) {
	console.error(err)
	process.exit(1)
}
