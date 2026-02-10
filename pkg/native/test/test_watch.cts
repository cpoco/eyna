import * as native from "@eyna/native/lib/browser.ts"

import path from "node:path/posix"
import timers from "node:timers/promises"

import { TEST } from "./_util.cts"

const main = async () => {
	const ID = 1
	const DIR1 = path.join(TEST, "watch1")
	const DIR2 = path.join(TEST, "👀")

	if (await native.exists(DIR1)) {
		await native.moveToTrash(DIR1)
	}
	await native.createDirectory(DIR1)
	native.watch(
		ID,
		DIR1,
		(id, depth, path) => {
			console.log("[watch callback]", id, depth, path)
		},
	)
	await timers.setTimeout(3000)
	await native.createDirectory(path.join(DIR1, "watch2", "d", "dd"))
	await native.createFile(path.join(DIR1, "watch2", "f"))
	await native.createFile(path.join(DIR1, "watch2", "ff"))
	await native.moveToTrash(path.join(DIR1, "watch2", "f"))
	await native.moveToTrash(path.join(DIR1, "watch2", "ff"))
	await native.moveToTrash(path.join(DIR1, "watch2", "d", "dd"))
	await native.moveToTrash(path.join(DIR1, "watch2", "d"))
	await native.moveToTrash(path.join(DIR1, "watch2"))
	await timers.setTimeout(3000)
	native.unwatch(ID)
	await native.moveToTrash(DIR1)

	if (await native.exists(DIR2)) {
		await native.moveToTrash(DIR2)
	}
	await native.createDirectory(DIR2)
	native.watch(
		ID,
		DIR2,
		(id, depth, path) => {
			console.log("[watch callback]", id, depth, path)
		},
	)
	await timers.setTimeout(3000)
	await native.createDirectory(path.join(DIR2, "👀👀", "📁", "📁📁"))
	await native.createFile(path.join(DIR2, "👀👀", "📝"))
	await native.createFile(path.join(DIR2, "👀👀", "📝📝"))
	await native.moveToTrash(path.join(DIR2, "👀👀", "📝"))
	await native.moveToTrash(path.join(DIR2, "👀👀", "📝📝"))
	await native.moveToTrash(path.join(DIR2, "👀👀", "📁", "📁📁"))
	await native.moveToTrash(path.join(DIR2, "👀👀", "📁"))
	await native.moveToTrash(path.join(DIR2, "👀👀"))
	await timers.setTimeout(3000)
	native.unwatch(ID)
	await native.moveToTrash(DIR2)
}

try {
	main().then(() => {
		console.log("")
		console.log("done (test_watch)")
	})
}
catch (err) {
	console.error(err)
}
