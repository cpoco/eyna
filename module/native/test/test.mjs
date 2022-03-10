import fs from "fs/promises"
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

const ID = "unique_id"
native.watch(
	ID,
	__dirname,
	(dir, file) => {
		console.log("watch callback", dir, file)
	}
)

setTimeout(async() => {
	await fs.writeFile(path.join(__dirname, "__testfile"), "")
}, 1000)

setTimeout(async () => {
	await fs.rm(path.join(__dirname, "__testfile"))
}, 2000)

setTimeout(() => {
	native.unwatch(ID)
}, 3000)
