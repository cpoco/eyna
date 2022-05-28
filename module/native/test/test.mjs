import path from "node:path"
import url from "node:url"
const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

import module from "node:module"
const require = module.createRequire(import.meta.url)
const native = require(path.join(__dirname, "../build/Release/native.node"))

const wd = path.join("C:", "Users", "Public", "eyna test")
// const wd = path.join("/", "Users", "Shared", "eyna test")

console.log("isElevated", native.isElevated())

console.log("getVolume", await native.getVolume())

console.log("getAttribute", await native.getAttribute(wd, ""))
console.log("getAttribute", await native.getAttribute(wd, wd))

console.log("getDirectory", await native.getDirectory(wd, "", false, 0, null))
console.log("getDirectory", await native.getDirectory(wd, wd, false, 0, null))

/*
const ID = 0
native.watch(
	ID,
	__dirname,
	(id, depth, path) => {
		console.log("watch callback", id, depth, path)
	},
)
setTimeout(() => {
	native.unwatch(ID)
}, 3000)

await native.createDirectory(path.join(__dirname, "__test🌈", "aaaa🍣", "bbbb🍺"))
await native.moveToTrash(path.join(__dirname, "__test🌈", "aaaa🍣", "bbbb🍺"))
await native.moveToTrash(path.join(__dirname, "__test🌈", "aaaa🍣"))
await native.moveToTrash(path.join(__dirname, "__test🌈"))

await native.createDirectory(path.join(__dirname, "__test🌈", "aaaa🍣", "bbbb🍺"))
await native.moveToTrash(path.join(__dirname, "__test🌈"))
*/