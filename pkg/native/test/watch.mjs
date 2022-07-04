import path from "node:path"
import process from "node:process"
import url from "node:url"
const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

import module from "node:module"
const require = module.createRequire(import.meta.url)
const native = require(path.join(__dirname, "../build/Release/native.node"))

if (process.platform == "win32") {
	var wd = path.join("C:", "Users", "Public", "eyna test")
}
else if (process.platform == "darwin") {
	var wd = path.join("/", "Users", "Shared", "eyna test")
}
else {
	process.exit()
}

const dir = path.join(wd, "watch_test")
await native.createDirectory(dir)
await native.moveToTrash(dir)

native.watch(
	0,
	wd,
	(id, depth, path) => {
		console.log("native.watch\tcallback", id, depth, path)
	},
)

import fs from "node:fs"
fs.watch(
	wd,
	(event, filename) => {
		console.log("fs.watch\tcallback", event, filename)
	},
)

setTimeout(() => {
	process.exit()
}, 3000)
