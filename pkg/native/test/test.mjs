import native from "@eyna/native/lib/index.mjs"

import assert from "node:assert"
import fs from "node:fs/promises"
import path from "node:path/posix"
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
		assert(d.list.length == d.d + d.f)
		assert(d.e == 0)

		const a = await native.getAttribute(root)
		assert(a.length == 1)
		assert(a[0].file_type == 1)
		assert(a[0].full == root)
		assert(a[0].base == "")
		assert(a[0].rltv == root)
		assert(a[0].name == "")
		assert(a[0].stem == "")
		assert(a[0].exte == "")
		assert(a[0].link_type == 0)
		assert(a[0].link == null)
	}

	{
		const p1 = await native.getPathAttribute(wd)
		const p2 = await native.getPathAttribute(wd + "/")
		if (process.platform == "win32") {
			assert(p1.length == 4)
			assert(p1[0].full == root)
			assert(p1[1].full == "C:/Users")
			assert(p1[2].full == "C:/Users/Public")
			assert(p1[3].full == "C:/Users/Public/eyna test")
		}
		else if (process.platform == "darwin") {
			assert(p1.length == 4)
			assert(p1[0].full == root)
			assert(p1[1].full == "/Users")
			assert(p1[2].full == "/Users/Shared")
			assert(p1[3].full == "/Users/Shared/eyna test")
		}
		assert(p1.length == p2.length)
		assert(p1[0].full == p2[0].full)
		assert(p1[1].full == p2[1].full)
		assert(p1[2].full == p2[2].full)
		assert(p1[3].full == p2[3].full)
	}

	{
		const a1 = await native.getAttribute(wd)
		const a2 = await native.getAttribute(wd + "/")
		assert(a1.length == 1)
		assert(a1[0].file_type == 1)
		assert(a1[0].full == wd)
		assert(a1[0].base == "")
		assert(a1[0].rltv == wd)
		assert(a1[0].name == "eyna test")
		assert(a1[0].stem == "eyna test")
		assert(a1[0].exte == "")
		assert(a1[0].link_type == 0)
		assert(a1[0].link == null)
		assert(a1.length       == a2.length)
		assert(a1[0].file_type == a2[0].file_type)
		assert(a1[0].full      == a2[0].full)
		assert(a1[0].base      == a2[0].base)
		assert(a1[0].rltv      == a2[0].rltv)
		assert(a1[0].name      == a2[0].name)
		assert(a1[0].stem      == a2[0].stem)
		assert(a1[0].exte      == a2[0].exte)
		assert(a1[0].link_type == a2[0].link_type)
		assert(a1[0].link      == a2[0].link)
	}

	{
		const full = wd + "/LINK/la_self_0"
		const link = wd + "/LINK"
		const l = await native.getAttribute(full)
		assert(l.length == 2)
		assert(l[0].file_type == 2)
		assert(l[0].full == full)
		assert(l[0].base == "")
		assert(l[0].rltv == full)
		assert(l[0].name == "la_self_0")
		assert(l[0].stem == "la_self_0")
		assert(l[0].exte == "")
		assert(l[0].link_type == 1)
		assert(l[0].link == link)
		assert(l[1].file_type == 1)
		assert(l[1].full == link)
		assert(l[1].base == "")
		assert(l[1].rltv == link)
		assert(l[1].name == "LINK")
		assert(l[1].stem == "LINK")
		assert(l[1].exte == "")
		assert(l[1].link_type == 0)
		assert(l[1].link == null)
	}

	for (const abst of [root, wd, wd + "/"]) {
		for (const base of ["", root, wd, wd + "/", path.join(wd, ".."), path.join(wd, "..") + "/"]) {
			const a = await native.getAttribute(abst, base)
			const d = await native.getDirectory(abst, base)

			assert(a[0].full == d.full)
			assert(a[0].base == d.base)

			assert(a.length == 1)
			assert(a[0].file_type == 1)
			assert(a[0].exte == "")
			assert(a[0].link_type == 0)
			assert(a[0].link == null)
			if (base == "") {
				assert(a[0].full == a[0].rltv)
			}
			if (abst == base) {
				assert(a[0].rltv == ".")
			}

			assert(0 < d.list.length)
			assert(d.list.length == d.d + d.f)
			assert(d.e == 0)
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
