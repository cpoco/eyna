import * as native from "@eyna/native/lib/browser.ts"

import assert from "node:assert"
import path from "node:path/posix"

import { TEST } from "./_util.mts"

const main = async () => {
	const DIR = path.join(TEST, "regexp")

	if (await native.exists(DIR)) {
		await native.moveToTrash(DIR)
	}
	await native.createDirectory(DIR)

	await native.createFile(path.join(DIR, "alpha.txt"))
	await native.createFile(path.join(DIR, "beta.txt"))
	await native.createFile(path.join(DIR, "gamma.md"))
	await native.createDirectory(path.join(DIR, "sub"))
	await native.createFile(path.join(DIR, "sub", "delta.txt"))
	await native.createFile(path.join(DIR, "sub", "epsilon.md"))

	{
		const d = await native.getDirectory(DIR, "", native.Sort.DepthFirst, 1, null)
		assert.strictEqual(d.list.length, 6)
		assert.strictEqual(d.d, 1)
		assert.strictEqual(d.f, 5)
		assert.strictEqual(d.e, 0)
	}

	{
		const d = await native.getDirectory(DIR, "", native.Sort.DepthFirst, 1, /\.txt$/)
		assert.strictEqual(d.list.length, 3)
		assert.strictEqual(d.list[0].rltv, path.join(DIR, "alpha.txt"))
		assert.strictEqual(d.list[1].rltv, path.join(DIR, "beta.txt"))
		assert.strictEqual(d.list[2].rltv, path.join(DIR, "sub", "delta.txt"))
		assert.strictEqual(d.s, 0n)
		assert.strictEqual(d.d, 0)
		assert.strictEqual(d.f, 3)
		assert.strictEqual(d.e, 0)
	}

	{
		const d = await native.getDirectory(DIR, "", native.Sort.DepthFirst, 1, /^sub$/)
		assert.strictEqual(d.list.length, 1)
		assert.strictEqual(d.list[0].rltv, path.join(DIR, "sub"))
		assert.strictEqual(d.s, 0n)
		assert.strictEqual(d.d, 1)
		assert.strictEqual(d.f, 0)
		assert.strictEqual(d.e, 0)
	}

	{
		const d = await native.getDirectory(DIR, "", native.Sort.DepthFirst, 1, /does-not-exist/)
		assert.strictEqual(d.list.length, 0)
		assert.strictEqual(d.s, 0n)
		assert.strictEqual(d.d, 0)
		assert.strictEqual(d.f, 0)
		assert.strictEqual(d.e, 0)
	}

	{
		const d = await native.getDirectory(DIR, "", native.Sort.DepthFirst, 0, /\.txt$/)
		assert.strictEqual(d.list.length, 2)
		assert.strictEqual(d.list[0].rltv, path.join(DIR, "alpha.txt"))
		assert.strictEqual(d.list[1].rltv, path.join(DIR, "beta.txt"))
		assert.strictEqual(d.s, 0n)
		assert.strictEqual(d.d, 0)
		assert.strictEqual(d.f, 2)
		assert.strictEqual(d.e, 0)
	}

	{
		const d = await native.getDirectory(DIR, "", native.Sort.ShallowFirst, 1, /\.txt$|^sub$/)
		assert.strictEqual(d.list.length, 4)
		assert.strictEqual(d.list[0].rltv, path.join(DIR, "alpha.txt"))
		assert.strictEqual(d.list[1].rltv, path.join(DIR, "beta.txt"))
		assert.strictEqual(d.list[2].rltv, path.join(DIR, "sub", "delta.txt"))
		assert.strictEqual(d.list[3].rltv, path.join(DIR, "sub"))
		assert.strictEqual(d.s, 0n)
		assert.strictEqual(d.d, 1)
		assert.strictEqual(d.f, 3)
		assert.strictEqual(d.e, 0)
	}
}

try {
	main().then(() => {
		console.log("")
		console.log("done (test_regexp)")
	})
}
catch (err) {
	console.error(err)
}
