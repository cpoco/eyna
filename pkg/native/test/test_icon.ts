import * as native from "@eyna/native/lib/browser.ts"

import assert from "node:assert"

import { ERROR, TEST } from "./_util.ts"

const main = async () => {
	const path_dir = await native.getIcon(TEST)
	assert(8 <= path_dir.length)
	assert.strictEqual(path_dir.at(0), 0x89)
	assert.strictEqual(path_dir.at(1), 0x50)
	assert.strictEqual(path_dir.at(2), 0x4e)
	assert.strictEqual(path_dir.at(3), 0x47)
	assert.strictEqual(path_dir.at(4), 0x0d)
	assert.strictEqual(path_dir.at(5), 0x0a)
	assert.strictEqual(path_dir.at(6), 0x1a)
	assert.strictEqual(path_dir.at(7), 0x0a)

	const dir = await native.getIconType("/")
	assert(8 < dir.length)
	assert.strictEqual(dir.at(0), 0x89)
	assert.strictEqual(dir.at(1), 0x50)
	assert.strictEqual(dir.at(2), 0x4e)
	assert.strictEqual(dir.at(3), 0x47)
	assert.strictEqual(dir.at(4), 0x0d)
	assert.strictEqual(dir.at(5), 0x0a)
	assert.strictEqual(dir.at(6), 0x1a)
	assert.strictEqual(dir.at(7), 0x0a)

	const file = await native.getIconType("")
	assert(8 < file.length)
	assert.strictEqual(file.at(0), 0x89)
	assert.strictEqual(file.at(1), 0x50)
	assert.strictEqual(file.at(2), 0x4e)
	assert.strictEqual(file.at(3), 0x47)
	assert.strictEqual(file.at(4), 0x0d)
	assert.strictEqual(file.at(5), 0x0a)
	assert.strictEqual(file.at(6), 0x1a)
	assert.strictEqual(file.at(7), 0x0a)

	const txt = await native.getIconType("txt")
	assert(8 < txt.length)
	assert.strictEqual(txt.at(0), 0x89)
	assert.strictEqual(txt.at(1), 0x50)
	assert.strictEqual(txt.at(2), 0x4e)
	assert.strictEqual(txt.at(3), 0x47)
	assert.strictEqual(txt.at(4), 0x0d)
	assert.strictEqual(txt.at(5), 0x0a)
	assert.strictEqual(txt.at(6), 0x1a)
	assert.strictEqual(txt.at(7), 0x0a)

	for (const error_path of ["", ".", "./", "..", "../"]) {
		await assert.rejects(
			async () => await native.getIcon(error_path),
			(err) => err === ERROR.INVALID_PATH,
		)
	}
}

try {
	main().then(() => {
		console.log("")
		console.log("done (test_icon)")
	})
}
catch (err) {
	console.error(err)
}
