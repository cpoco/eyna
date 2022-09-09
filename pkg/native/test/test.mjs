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

console.log("isElevated", native.isElevated())

console.log("getVolume", await native.getVolume())

console.log("getAttribute", await native.getAttribute(wd, ""))
console.log("getAttribute", await native.getAttribute(wd + "/", ""))
console.log("getAttribute", await native.getAttribute(wd, wd))
console.log("getAttribute", await native.getAttribute(wd + "/", wd))
console.log("getAttribute", await native.getAttribute(wd, path.join(wd, "..")))
console.log("getAttribute", await native.getAttribute(wd + "/", path.join(wd, "..")))

console.log("getDirectory", await native.getDirectory(wd, "", false, 0, null))
console.log("getDirectory", await native.getDirectory(wd + "/", "", false, 0, null))
console.log("getDirectory", await native.getDirectory(wd, wd, false, 0, null))
console.log("getDirectory", await native.getDirectory(wd + "/", wd, false, 0, null))
console.log("getDirectory", await native.getDirectory(wd, path.join(wd, ".."), false, 0, null))
console.log("getDirectory", await native.getDirectory(wd + "/", path.join(wd, ".."), false, 0, null))

const ID = 0
native.watch(
	ID,
	wd,
	(id, depth, path) => {
		console.log("watch callback", id, depth, path)
	},
)
setTimeout(() => {
	native.unwatch(ID)
}, 3000)

await native.createDirectory(path.join(wd, "watch", "d", "d"))
await native.createFile(path.join(wd, "watch", "f"))
await native.moveToTrash(path.join(wd, "watch", "f"))
await native.moveToTrash(path.join(wd, "watch", "d", "d"))
await native.moveToTrash(path.join(wd, "watch", "d"))
await native.moveToTrash(path.join(wd, "watch"))
