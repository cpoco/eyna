import native from "@eyna/native/esm/index.mjs"
import fs from "node:fs/promises"
import path from "node:path"
import process from "node:process"
import timers from "node:timers/promises"

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

console.log("exists", await native.exists(wd))

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

const data = await native.getIcon(wd)
const png = path.join(wd, "test.png")
await fs.writeFile(png, data)
await native.moveToTrash(png)

const ID = 0
native.watch(
	ID,
	wd,
	(id, depth, path) => {
		console.log("watch callback", id, depth, path)
	},
)

await native.createDirectory(path.join(wd, "watch", "d", "d"))
await native.createFile(path.join(wd, "watch", "f"))
await native.moveToTrash(path.join(wd, "watch", "f"))
await native.moveToTrash(path.join(wd, "watch", "d", "d"))
await native.moveToTrash(path.join(wd, "watch", "d"))
await native.moveToTrash(path.join(wd, "watch"))

await timers.setTimeout(3000)

native.unwatch(ID)
