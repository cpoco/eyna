import * as native from "@eyna/native/lib/browser.ts"

import assert from "node:assert"
import path from "node:path/posix"

import { ERROR } from "./_util.mts"

const main = async () => {
	const RAR = path.join(import.meta.dirname ?? __dirname, "fixtures", "test_pw2.rar")

	const arc = await native.getArchive(RAR, "", 10)

	assert.strictEqual(arc.s, 0n)
	assert.strictEqual(arc.d, 0)
	assert.strictEqual(arc.f, 0)
	assert.strictEqual(arc.e, 0)

	assert.strictEqual(arc.henc, true)
	assert.strictEqual(arc.list.length, 0)

	await assert.rejects(
		async () => await native.getArchiveEntry(RAR, "not-found.txt"),
		(err) => err === ERROR.FAILED,
	)
	await assert.rejects(
		async () => await native.getArchiveEntry(RAR + ".not-found", "file.txt"),
		(err) => err === ERROR.FAILED,
	)

	for (const error_path of ["", ".", "./", "..", "../"]) {
		await assert.rejects(
			async () => await native.getArchive(error_path, ""),
			(err) => err === ERROR.INVALID_PATH,
		)
	}

	for (const error_path of [".", "./", "..", "../"]) {
		await assert.rejects(
			async () => await native.getArchive(RAR, error_path),
			(err) => err === ERROR.INVALID_T_PATH,
		)
		await assert.rejects(
			async () => await native.getArchiveEntry(RAR, error_path),
			(err) => err === ERROR.INVALID_T_PATH,
		)
	}
}

try {
	main().then(() => {
		console.log("")
		console.log("done (test_arc_rar_pw2)")
	})
}
catch (err) {
	console.error(err)
}
