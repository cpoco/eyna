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

	{
		assert(typeof native.isElevated() == "boolean")
	}

	{
		const v = await native.getVolume()
		assert(0 < v.length)
	}

	{
		assert(await native.exists(wd) == true)
		assert(await native.exists(path.join(wd, "fake")) == false)
	}

	{
		const d = await native.getDirectory(root)
		assert(d.full == root)
		assert(d.base == "")
		assert(0 < d.list.length)
		const a = await native.getAttribute(root)
		assert(0 < a.length)
		assert(a[0].full == root)
		assert(a[0].base == "")
	}

	{
		const a1 = await native.getAttribute(wd)
		const a2 = await native.getAttribute(wd + "/")
		assert(a1[0].full == wd)
		assert(a2[0].full == wd)
	}

	for (const abst of [root, wd, wd + "/"]) {
		for (const base of ["", root, wd, wd + "/", path.join(wd, ".."), path.join(wd, "..") + "/"]) {
			const a = await native.getAttribute(abst, base)
			const d = await native.getDirectory(abst, base)
			console.log(a, d)
			assert(0 < a.length)
			assert(0 < d.list.length)
			assert(d.e == 0)
			assert(a[0].full == d.full)
			assert(a[0].base == d.base)
			if (base == "") {
				assert(a[0].rltv == a[0].full)
			}
			if (abst == base) {
				assert(a[0].rltv == ".")
			}
		}
	}

	{
		const data = await native.getIcon(wd)
		const png = path.join(wd, `test-${(new Date()).getTime()}.png`)
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
