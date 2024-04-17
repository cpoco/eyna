import fse from "fs-extra"
import child_process from "node:child_process"
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

	const cmd = [
		"npx",
		"node-gyp",
		"rebuild",
		`--target=${electron.version}`,
		`--arch=${arch}`,
		"--dist-url=https://electronjs.org/headers",
	]

	await new Promise((resolve, reject) => {
		child_process.exec(
			cmd.join(" "),
			{
				cwd: path.join(__top, "node_modules/@eyna/native"),
			},
			(error, _stdout, _stderr) => {
				if (error) {
					reject(error)
				}
				else {
					resolve()
				}
			},
		)
	})

	await fse.copyFile(
		path.join(__top, "node_modules/@eyna/native/build/Release/native.node"),
		path.join(outdir, "native.node"),
	)

	console.log(`native ${(perf_hooks.performance.now() - _time).toFixed(0)}ms`)
}
