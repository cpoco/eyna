import native from "@eyna/native/esm/index.mjs"
import path from "node:path"
import process from "node:process"

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
