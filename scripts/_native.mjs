import * as rebuild from "@electron/rebuild"
import fse from "fs-extra"
import module from "node:module"
import path from "node:path"
import url from "node:url"

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const __top = path.join(__dirname, "..")
const __build = path.join(__top, "build")

const outdir = path.join(__build, "app")

const electron = module.createRequire(import.meta.url)(path.join(__top, "node_modules/electron/package.json"))

export async function Build(arch, release = true) {
	await fse.ensureDir(outdir)
	return rebuild.rebuild({
		buildPath: __top,
		arch: arch,
		electronVersion: electron.version,
		onlyModules: ["native"],
		force: true,
	})
		.then(() => {
			if (release) {
				return fse.copyFile(
					path.join(__top, "node_modules/@eyna/native/build/Release/native.node"),
					path.join(outdir, "native.node"),
				)
			}
			else {
				return Promise.resolve()
			}
		})
}
