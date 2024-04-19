import { BuildElectron } from "@eyna/native/scripts/build.mjs"
import fse from "fs-extra"
import module from "node:module"
import path from "node:path"
import * as perf_hooks from "node:perf_hooks"
import url from "node:url"

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const __top = path.join(__dirname, "..")
const __build = path.join(__top, "build")

const outdir = path.join(__build, "app")

const electron = module.createRequire(import.meta.url)(path.join(__top, "node_modules/electron/package.json"))

export async function Build(arch) {
	let _time = perf_hooks.performance.now()
	await fse.ensureDir(outdir)

	const outfile = await BuildElectron(electron.version, arch)

	await fse.copyFile(outfile, path.join(outdir, "native.node"))

	console.log(`native ${(perf_hooks.performance.now() - _time).toFixed(0)}ms`)
}
