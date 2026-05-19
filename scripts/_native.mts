import fs from "node:fs/promises"
import path from "node:path"
import * as perf_hooks from "node:perf_hooks"

import { build, configure, setVsCmdEnv } from "@eyna/native/scripts/_cmake.mts"

import electron from "../node_modules/electron/package.json" with { type: "json" }

const __top = path.join(import.meta.dirname, "..")
const __build = path.join(__top, "build")

const outdir = path.join(__build, "bin")

export async function Build() {
	let _time = perf_hooks.performance.now()

	Promise.resolve()
		.then(() => {
			return setVsCmdEnv()
		})
		.then(() => {
			return configure("electron", electron.version)
		})
		.then(() => {
			return build()
		})
		.then((outfile: string) => {
			return fs.cp(outfile, path.join(outdir, path.basename(outfile)))
		})
		.then(() => {
			console.log(`native ${(perf_hooks.performance.now() - _time).toFixed(0)}ms`)
			return Promise.resolve()
		})
		.catch((err) => {
			console.error(err)
			process.exit(1)
		})
}
