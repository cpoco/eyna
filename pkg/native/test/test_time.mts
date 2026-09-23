import * as native from "@eyna/native/lib/browser.ts"

import assert from "node:assert"
import path from "node:path/posix"

import { ERROR, TEST } from "./_util.mts"

const CTIME = 1735689600_000000000n // 2025/01/01
const MTIME = 1738368000_000000000n // 2025/02/01

const main = async () => {
	const DIR = path.join(TEST, "time")

	if (await native.exists(DIR)) {
		await native.moveToTrash(DIR)
	}
	await native.createDirectory(DIR)

	{
		const file = path.join(DIR, "file")
		await native.createFile(file)

		await native.setTime(file, CTIME, MTIME)

		const a = await native.getAttribute(file)
		assert.strictEqual(a.length, 1)
		assert.strictEqual(a[0].ctime, CTIME)
		assert.strictEqual(a[0].mtime, MTIME)
	}

	{
		const dir = path.join(DIR, "dir")
		await native.createDirectory(dir)

		await native.setTime(dir, CTIME, MTIME)

		const a = await native.getAttribute(dir)
		assert.strictEqual(a.length, 1)
		assert.strictEqual(a[0].ctime, CTIME)
		assert.strictEqual(a[0].mtime, MTIME)
	}

	{
		const link = path.join(DIR, "link")
		await native.createSymlink(link, path.join(DIR, "file"))

		await native.setTime(link, CTIME, MTIME)

		const a = await native.getAttribute(link)
		assert.strictEqual(a.length, 2)
		assert.strictEqual(a[0].ctime, CTIME)
		assert.strictEqual(a[0].mtime, MTIME)
	}

	await assert.rejects(
		async () => await native.setTime(path.join(DIR, "test-not-exist-file"), CTIME, MTIME),
		(err) => err === ERROR.FAILED,
	)

	for (const error_path of ["", ".", "./", "..", "../"]) {
		await assert.rejects(
			async () => await native.setTime(error_path, CTIME, MTIME),
			(err) => err === ERROR.INVALID_PATH,
		)
	}
}

try {
	main().then(() => {
		console.log("")
		console.log("done (test_time)")
	})
}
catch (err) {
	console.error(err)
}
