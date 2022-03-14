import path from "path"
import url from "url"
const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

import module from "module"
const require = module.createRequire(import.meta.url)
const native = require("../build/Release/native.node")

console.log("isElevated", native.isElevated())

const v = await native.getVolume()
console.log("getVolume", v)

const d = await native.getDirectory(v[0].full, "", false, 0, null)
console.log("getDirectory", d)

const a = await native.getAttribute(d.ls[0], "")
console.log("getAttribute", a)

const ID = 0
native.watch(
	ID,
	__dirname,
	(id, path) => {
		console.log("watch callback", id, path)
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
