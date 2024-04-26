import native from "@eyna/native/lib/index.mjs"
import fs from "node:fs"
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

const dir = path.join(wd, "watch_test")
await native.createDirectory(dir)
await native.moveToTrash(dir)

// ウオッチ開始で直前の操作が通知されるのは fs.watch と同様なのか確認する

const ID = 0
native.watch(
	ID,
	wd,
	(id, depth, path) => {
		console.log("native.watch\tcallback", id, depth, path)
	},
)

const fsw = fs.watch(
	wd,
	(event, filename) => {
		console.log("fs.watch\tcallback", event, filename)
	},
)

await timers.setTimeout(3000)

native.unwatch(ID)
fsw.close()
