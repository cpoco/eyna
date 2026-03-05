import * as native from "@eyna/native/lib/browser.ts"

import assert from "node:assert"
import path from "node:path/posix"

import { TEST } from "./_util.cts"

const main = async () => {
	const DIR = path.join(TEST, "archive")

	if (await native.exists(DIR)) {
		await native.moveToTrash(DIR)
	}
	await native.createDirectory(path.join(DIR))

	await native.createFile(path.join(DIR, "arc.tar.gz"))
	await native.createFile(path.join(DIR, "arc.tar.xz"))

	native.setExte([
		".tar.gz",
		".tar.xz",
	])

	{
		const tgz = await native.getAttribute(path.join(DIR, "arc.tar.gz"))
		assert.strictEqual(tgz.length, 1)
		assert.strictEqual(tgz[0].file_type, 3)
		assert.strictEqual(tgz[0].full, path.join(DIR, "arc.tar.gz"))
		assert.strictEqual(tgz[0].base, "")
		assert.strictEqual(tgz[0].rltv, path.join(DIR, "arc.tar.gz"))
		assert.strictEqual(tgz[0].name, "arc.tar.gz")
		assert.strictEqual(tgz[0].stem, "arc")
		assert.strictEqual(tgz[0].exte, ".tar.gz")
		assert.strictEqual(tgz[0].link_type, 0)
		assert.strictEqual(tgz[0].link, null)
		assert.strictEqual(tgz[0].size, 0n)

		const txz = await native.getAttribute(path.join(DIR, "arc.tar.xz"))
		assert.strictEqual(txz.length, 1)
		assert.strictEqual(txz[0].file_type, 3)
		assert.strictEqual(txz[0].full, path.join(DIR, "arc.tar.xz"))
		assert.strictEqual(txz[0].base, "")
		assert.strictEqual(txz[0].rltv, path.join(DIR, "arc.tar.xz"))
		assert.strictEqual(txz[0].name, "arc.tar.xz")
		assert.strictEqual(txz[0].stem, "arc")
		assert.strictEqual(txz[0].exte, ".tar.xz")
		assert.strictEqual(txz[0].link_type, 0)
		assert.strictEqual(txz[0].link, null)
		assert.strictEqual(txz[0].size, 0n)
	}

	native.setExte([])

	{
		const tgz = await native.getAttribute(path.join(DIR, "arc.tar.gz"))
		assert.strictEqual(tgz.length, 1)
		assert.strictEqual(tgz[0].file_type, 3)
		assert.strictEqual(tgz[0].full, path.join(DIR, "arc.tar.gz"))
		assert.strictEqual(tgz[0].base, "")
		assert.strictEqual(tgz[0].rltv, path.join(DIR, "arc.tar.gz"))
		assert.strictEqual(tgz[0].name, "arc.tar.gz")
		assert.strictEqual(tgz[0].stem, "arc.tar")
		assert.strictEqual(tgz[0].exte, ".gz")
		assert.strictEqual(tgz[0].link_type, 0)
		assert.strictEqual(tgz[0].link, null)
		assert.strictEqual(tgz[0].size, 0n)

		const txz = await native.getAttribute(path.join(DIR, "arc.tar.xz"))
		assert.strictEqual(txz.length, 1)
		assert.strictEqual(txz[0].file_type, 3)
		assert.strictEqual(txz[0].full, path.join(DIR, "arc.tar.xz"))
		assert.strictEqual(txz[0].base, "")
		assert.strictEqual(txz[0].rltv, path.join(DIR, "arc.tar.xz"))
		assert.strictEqual(txz[0].name, "arc.tar.xz")
		assert.strictEqual(txz[0].stem, "arc.tar")
		assert.strictEqual(txz[0].exte, ".xz")
		assert.strictEqual(txz[0].link_type, 0)
		assert.strictEqual(txz[0].link, null)
		assert.strictEqual(txz[0].size, 0n)
	}
}

try {
	main().then(() => {
		console.log("")
		console.log("done (test_arc)")
	})
}
catch (err) {
	console.error(err)
}
