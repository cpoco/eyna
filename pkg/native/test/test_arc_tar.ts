import * as native from "@eyna/native/lib/browser.ts"

import assert from "node:assert"
import path from "node:path/posix"

import { ERROR } from "./_util.ts"

const main = async () => {
	const TAR = path.join(import.meta.dirname ?? __dirname, "fixtures", "test.tar")

	const arc = await native.getArchive(TAR, "", 10)

	assert.strictEqual(arc.s, 35n)
	assert.strictEqual(arc.d, 5)
	assert.strictEqual(arc.f, 4)
	assert.strictEqual(arc.e, 0)

	assert.strictEqual(arc.list.length, 9)

	assert.strictEqual(arc.list[0].file_type, 1)
	assert.strictEqual(arc.list[0].full, "dir/")
	assert.strictEqual(arc.list[0].link_type, 0)
	assert.strictEqual(arc.list[0].link, null)
	assert.strictEqual(arc.list[0].size, 0n)
	assert.strictEqual(arc.list[0].time, 1735689600)
	assert.strictEqual(arc.list[0].nsec, 0)

	assert.strictEqual(arc.list[1].file_type, 1)
	assert.strictEqual(arc.list[1].full, "dir/dir")
	assert.strictEqual(arc.list[1].link_type, 0)
	assert.strictEqual(arc.list[1].link, null)
	assert.strictEqual(arc.list[1].size, 0n)
	assert.strictEqual(arc.list[1].time, 0)
	assert.strictEqual(arc.list[1].nsec, 0)

	assert.strictEqual(arc.list[2].file_type, 1)
	assert.strictEqual(arc.list[2].full, "dir/dir/dir")
	assert.strictEqual(arc.list[2].link_type, 0)
	assert.strictEqual(arc.list[2].link, null)
	assert.strictEqual(arc.list[2].size, 0n)
	assert.strictEqual(arc.list[2].time, 0)
	assert.strictEqual(arc.list[2].nsec, 0)

	assert.strictEqual(arc.list[3].file_type, 1)
	assert.strictEqual(arc.list[3].full, "dir/dir/dir/dir")
	assert.strictEqual(arc.list[3].link_type, 0)
	assert.strictEqual(arc.list[3].link, null)
	assert.strictEqual(arc.list[3].size, 0n)
	assert.strictEqual(arc.list[3].time, 0)
	assert.strictEqual(arc.list[3].nsec, 0)

	assert.strictEqual(arc.list[4].file_type, 1)
	assert.strictEqual(arc.list[4].full, "dir/dir/dir/dir/dir/")
	assert.strictEqual(arc.list[4].link_type, 0)
	assert.strictEqual(arc.list[4].link, null)
	assert.strictEqual(arc.list[4].size, 0n)
	assert.strictEqual(arc.list[4].time, 1735689600)
	assert.strictEqual(arc.list[4].nsec, 0)

	assert.strictEqual(arc.list[5].file_type, 3)
	assert.strictEqual(arc.list[5].full, "dir/file.txt")
	assert.strictEqual(arc.list[5].link_type, 0)
	assert.strictEqual(arc.list[5].link, null)
	assert.strictEqual(arc.list[5].size, 12n)
	assert.strictEqual(arc.list[5].time, 1735689600)
	assert.strictEqual(arc.list[5].nsec, 0)

	assert.strictEqual(arc.list[6].file_type, 3)
	assert.strictEqual(arc.list[6].full, "file.txt")
	assert.strictEqual(arc.list[6].link_type, 0)
	assert.strictEqual(arc.list[6].link, null)
	assert.strictEqual(arc.list[6].size, 8n)
	assert.strictEqual(arc.list[6].time, 1735689600)
	assert.strictEqual(arc.list[6].nsec, 0)

	assert.strictEqual(arc.list[7].file_type, 3)
	assert.strictEqual(arc.list[7].full, "🍋")
	assert.strictEqual(arc.list[7].link_type, 0)
	assert.strictEqual(arc.list[7].link, null)
	assert.strictEqual(arc.list[7].size, 4n)
	assert.strictEqual(arc.list[7].time, 1735689600)
	assert.strictEqual(arc.list[7].nsec, 0)

	assert.strictEqual(arc.list[8].file_type, 3)
	assert.strictEqual(arc.list[8].full, "🍋‍🟩")
	assert.strictEqual(arc.list[8].link_type, 0)
	assert.strictEqual(arc.list[8].link, null)
	assert.strictEqual(arc.list[8].size, 11n)
	assert.strictEqual(arc.list[8].time, 1735689600)
	assert.strictEqual(arc.list[8].nsec, 0)

	for (const error_path of ["", ".", "./", "..", "../"]) {
		await assert.rejects(
			async () => await native.getArchive(error_path, ""),
			(err) => err === ERROR.INVALID_PATH,
		)
	}

	for (const error_path of [".", "./", "..", "../"]) {
		await assert.rejects(
			async () => await native.getArchive(TAR, error_path),
			(err) => err === ERROR.INVALID_T_PATH,
		)
		await assert.rejects(
			async () => await native.getArchiveEntry(TAR, error_path),
			(err) => err === ERROR.INVALID_T_PATH,
		)
	}
}

try {
	main().then(() => {
		console.log("")
		console.log("done (test_arc_tar)")
	})
}
catch (err) {
	console.error(err)
}
