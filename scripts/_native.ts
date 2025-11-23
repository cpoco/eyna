import fs from "node:fs/promises"
import module from "node:module"
import path from "node:path"
import * as perf_hooks from "node:perf_hooks"

import { cmake } from "@eyna/native/scripts/_cmake.ts"

const __top = path.join(import.meta.dirname ?? __dirname, "..")
const __build = path.join(__top, "build")

const outdir = path.join(__build, "bin")

const electron = module.createRequire(import.meta.url)(path.join(__top, "node_modules/electron/package.json"))

export async function Build() {
	let _time = perf_hooks.performance.now()

	const outfile = cmake("electron", electron.version)

	await fs.cp(outfile, path.join(outdir, "native.node"))

	console.log(`native ${(perf_hooks.performance.now() - _time).toFixed(0)}ms`)
}
