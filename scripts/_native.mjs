import * as electron_rebuild from "electron-rebuild"
import fs from "node:fs/promises"
import module from "node:module"
import path from "node:path"
import url from "node:url"

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const __top = path.join(__dirname, "..")

const electron = module.createRequire(import.meta.url)(path.join(__top, "node_modules/electron/package.json"))

export async function Build(arch, release = true) {
	return electron_rebuild.rebuild({
		buildPath: __top,
		arch: arch,
		electronVersion: electron.version,
		onlyModules: ["native"],
		force: true,
	})
		.then(() => {
			if (release) {
				return fs.copyFile(
					path.join(__top, "node_modules/@eyna/native/build/Release/native.node"),
					path.join(__top, "app/native.node"),
				)
			}
			else {
				return Promise.resolve()
			}
		})
}
