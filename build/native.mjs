import fs from "fs/promises"
import module from "module"
import path from "path"
import url from "url"

import * as electron_rebuild from "electron-rebuild"

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const electron = module.createRequire(import.meta.url)(path.join(__dirname, "../node_modules/electron/package.json"))

export async function Build() {
	return electron_rebuild.rebuild({
		buildPath: path.join(__dirname, ".."),
		electronVersion: electron.version,
		onlyModules: ['native'],
		force: true
	})
		.then(() => {
			return fs.copyFile(
				path.join(__dirname, "../node_modules/@module/native/build/Release/native.node"),
				path.join(__dirname, "../app/native.node")
			)
		})

}
