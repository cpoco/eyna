import native from "@eyna/native/lib/index.mjs"

import assert from "node:assert"
import fs from "node:fs/promises"
import path from "node:path"
import timers from "node:timers/promises"

if (process.platform == "win32") {
	var root = "C:/"
	var wd = path.join(root, "Users", "Public", "eyna test")
}
else if (process.platform == "darwin") {
	var root = "/"
	var wd = path.join(root, "Users", "Shared", "eyna test")
}
else {
	process.exit()
}

const main = async () => {
	console.log(native)
	console.log("isElevated", native.isElevated())
	console.log("getVolume", await native.getVolume())
	console.log("exists", await native.exists(wd))

	for (const abst of [root, wd, wd + "/"]) {
		for (const base of ["", root, wd, wd + "/", path.join(wd, ".."), path.join(wd, "..") + "/"]) {
			console.log("getAttribute", await native.getAttribute(abst, base))
			console.log("getDirectory", await native.getDirectory(abst, base))
		}
	}

	{
		const root1 = await native.getAttribute(root)
		assert(root == root1[0].full)
	}

	{
		const attr1 = await native.getAttribute(wd)
		const attr2 = await native.getAttribute(wd + "/")
		assert(wd == attr1[0].full)
		assert(wd == attr2[0].full)
	}

	{
		const data = await native.getIcon(wd)
		const png = path.join(wd, "test.png")
		await fs.writeFile(png, data)
		await native.moveToTrash(png)
	}

	{
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
	}
}

try {
	main().then(() => {
		console.log("")
		console.log("done")
	})
}
catch (err) {
	console.error(err)
}
