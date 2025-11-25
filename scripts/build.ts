import fs from "node:fs"
import path from "node:path"

import * as app from "./_app.ts"
import * as extension from "./_extension.ts"
import * as native from "./_native.ts"
import * as pug from "./_pug.ts"
import * as stylus from "./_stylus.ts"

const __top = path.join(import.meta.dirname ?? __dirname, "..")

console.log(`build (${process.arch})\n`)

Promise.resolve()
	.then(() => {
		return fs.promises.rm(path.join(__top, "build"), { recursive: true, force: true })
	})
	.then(() => {
		return Promise.all([
			fs.promises.mkdir(path.join(__top, "build", "app"), { recursive: true }),
			fs.promises.mkdir(path.join(__top, "build", "bin"), { recursive: true }),
			fs.promises.mkdir(path.join(__top, "build", "config"), { recursive: true }),
			fs.promises.mkdir(path.join(__top, "build", "extension"), { recursive: true }),
		])
	})
	.then(() => {
		return Promise.all([
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
	})
	.catch((err) => {
		console.error(err)
		process.exit(1)
	})
