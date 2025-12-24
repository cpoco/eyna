import * as native from "@eyna/native/lib/browser.ts"

import assert from "node:assert"
import fs from "node:fs/promises"
import path from "node:path/posix"

import { TEST } from "./_util.ts"

const main = async () => {
	const DIR = path.join(TEST, "compare")

	if (await native.exists(DIR)) {
		await native.moveToTrash(DIR)
	}
	await native.createDirectory(path.join(DIR))

	await native.createFile(path.join(DIR, "file1"))
	await native.createFile(path.join(DIR, "file2"))
	assert.strictEqual(await native.compare(path.join(DIR, "file1"), path.join(DIR, "file2")), true)

	await fs.writeFile(path.join(DIR, "file1"), "test")
	await fs.writeFile(path.join(DIR, "file2"), "test")
	assert.strictEqual(await native.compare(path.join(DIR, "file1"), path.join(DIR, "file2")), true)

	await fs.writeFile(path.join(DIR, "file2"), "TEST")
	assert.strictEqual(await native.compare(path.join(DIR, "file1"), path.join(DIR, "file2")), false)

	await native.moveToTrash(path.join(DIR))
}

try {
	main().then(() => {
		console.log("")
		console.log("done (test_compare)")
	})
}
catch (err) {
	console.error(err)
}
