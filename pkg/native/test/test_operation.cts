import * as native from "@eyna/native/lib/browser.ts"

import assert from "node:assert"
import path from "node:path/posix"

import { ERROR, TEST } from "./_util.cts"

const main = async () => {
	const DIR = path.join(TEST, "exists")

	assert.strictEqual(await native.exists(TEST), true)
	assert.strictEqual(await native.exists(path.join(TEST, "fake")), false)

	if (await native.exists(DIR)) {
		await native.moveToTrash(DIR)
	}
	await native.createDirectory(DIR)

	await native.createFile(path.join(DIR, "file"))
	assert.strictEqual(await native.exists(path.join(DIR, "file")), true)

	await native.createSymlink(path.join(DIR, "symlink"), path.join(DIR, "file"))
	assert.strictEqual(await native.exists(path.join(DIR, "symlink")), true)

	await native.moveToTrash(path.join(DIR, "file"))
	assert.strictEqual(await native.exists(path.join(DIR, "file")), false)
	assert.strictEqual(await native.exists(path.join(DIR, "symlink")), true)

	await native.moveToTrash(path.join(DIR, "symlink"))
	assert.strictEqual(await native.exists(path.join(DIR, "symlink")), false)

	await native.moveToTrash(DIR)

	{
		if (await native.exists(path.join(TEST, "test-exist-file"))) {
			await native.moveToTrash(path.join(TEST, "test-exist-file"))
		}
		await native.createFile(path.join(TEST, "test-exist-file"))

		await assert.rejects(
			async () => await native.createFile(path.join(TEST, "test-exist-file")),
			(err) => err === ERROR.FAILED,
		)

		await assert.rejects(
			async () => await native.createDirectory(path.join(TEST, "test-exist-file")),
			(err) => err === ERROR.FAILED,
		)

		await assert.rejects(
			async () => await native.createSymlink(path.join(TEST, "test-exist-file"), TEST),
			(err) => err === ERROR.FAILED,
		)

		await native.moveToTrash(path.join(TEST, "test-exist-file"))
	}

	{
		if (await native.exists(path.join(TEST, "test-exist-directory"))) {
			await native.moveToTrash(path.join(TEST, "test-exist-directory"))
		}
		await native.createDirectory(path.join(TEST, "test-exist-directory"))

		await assert.rejects(
			async () => await native.createFile(path.join(TEST, "test-exist-directory")),
			(err) => err === ERROR.FAILED,
		)

		await assert.rejects(
			async () => await native.createDirectory(path.join(TEST, "test-exist-directory")),
			(err) => err === ERROR.FAILED,
		)

		await assert.rejects(
			async () => await native.createSymlink(path.join(TEST, "test-exist-directory"), TEST),
			(err) => err === ERROR.FAILED,
		)

		await native.moveToTrash(path.join(TEST, "test-exist-directory"))
	}

	await assert.rejects(
		async () => await native.createFile(path.join(TEST, "test-not-exist-directory", "file")),
		(err) => err === ERROR.FAILED,
	)

	await assert.rejects(
		async () => await native.createSymlink(path.join(TEST, "test-not-exist-directory", "link"), TEST),
		(err) => err === ERROR.FAILED,
	)

	await assert.rejects(
		async () => await native.moveToTrash(path.join(TEST, "test-not-exist-directory")),
		(err) => err === ERROR.FAILED,
	)

	for (const error_path of ["", ".", "./", "..", "../"]) {
		await assert.rejects(
			async () => await native.createFile(error_path),
			(err) => err === ERROR.INVALID_PATH,
		)
		await assert.rejects(
			async () => await native.createDirectory(error_path),
			(err) => err === ERROR.INVALID_PATH,
		)
		await assert.rejects(
			async () => await native.createSymlink(error_path, TEST),
			(err) => err === ERROR.INVALID_PATH,
		)
		await assert.rejects(
			async () => await native.createSymlink(path.join(TEST, "symlink"), error_path),
			(err) => err === ERROR.INVALID_PATH,
		)
		await assert.rejects(
			async () => await native.moveToTrash(error_path),
			(err) => err === ERROR.INVALID_PATH,
		)
	}
}

try {
	main().then(() => {
		console.log("")
		console.log("done (test_operation)")
	})
}
catch (err) {
	console.error(err)
}
