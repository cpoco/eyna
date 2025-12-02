import fs from "node:fs"
import path from "node:path"

import * as pk from "./_package.ts"

const __top = path.join(import.meta.dirname ?? __dirname, "..")

console.log(`package (${process.arch})\n`)

Promise.resolve()
	.then(() => {
		return fs.promises.rm(path.join(__top, "dist"), { recursive: true, force: true })
	})
	.then(() => {
		return pk.Package()
	})
	.catch((err) => {
		console.error(err)
		process.exit(1)
	})
