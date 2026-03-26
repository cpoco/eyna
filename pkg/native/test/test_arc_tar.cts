import * as native from "@eyna/native/lib/browser.ts"

import assert from "node:assert"
import path from "node:path/posix"

import { ERROR, readStream } from "./_util.cts"

const main = async () => {
	const TAR = path.join(import.meta.dirname ?? __dirname, "fixtures", "test.tar")

	const arc = await native.getArchive(TAR, "", 10)

	assert.strictEqual(arc.s, 35n)
	assert.strictEqual(arc.d, 5)
	assert.strictEqual(arc.f, 4)
	assert.strictEqual(arc.e, 0)

	assert.strictEqual(arc.henc, false)
	assert.strictEqual(arc.list.length, 9)

	assert.strictEqual(arc.list[0].file_type, 1)
	assert.strictEqual(arc.list[0].full, "dir/")
	assert.strictEqual(arc.list[0].link_type, 0)
	assert.strictEqual(arc.list[0].link, null)
	assert.strictEqual(arc.list[0].size, 0n)
	assert.strictEqual(arc.list[0].time, 1735689600)
	assert.strictEqual(arc.list[0].nsec, 0)
	assert.strictEqual(arc.list[0].x?.entry, 1)

	assert.strictEqual(arc.list[1].file_type, 1)
	assert.strictEqual(arc.list[1].full, "dir/dir")
	assert.strictEqual(arc.list[1].link_type, 0)
	assert.strictEqual(arc.list[1].link, null)
	assert.strictEqual(arc.list[1].size, 0n)
	assert.strictEqual(arc.list[1].time, 0)
	assert.strictEqual(arc.list[1].nsec, 0)
	assert.strictEqual(arc.list[1].x?.entry, 1)

	assert.strictEqual(arc.list[2].file_type, 1)
	assert.strictEqual(arc.list[2].full, "dir/dir/dir")
	assert.strictEqual(arc.list[2].link_type, 0)
	assert.strictEqual(arc.list[2].link, null)
	assert.strictEqual(arc.list[2].size, 0n)
	assert.strictEqual(arc.list[2].time, 0)
	assert.strictEqual(arc.list[2].nsec, 0)
	assert.strictEqual(arc.list[2].x?.entry, 1)

	assert.strictEqual(arc.list[3].file_type, 1)
	assert.strictEqual(arc.list[3].full, "dir/dir/dir/dir")
	assert.strictEqual(arc.list[3].link_type, 0)
	assert.strictEqual(arc.list[3].link, null)
	assert.strictEqual(arc.list[3].size, 0n)
	assert.strictEqual(arc.list[3].time, 0)
	assert.strictEqual(arc.list[3].nsec, 0)
	assert.strictEqual(arc.list[3].x?.entry, 1)

	assert.strictEqual(arc.list[4].file_type, 1)
	assert.strictEqual(arc.list[4].full, "dir/dir/dir/dir/dir/")
	assert.strictEqual(arc.list[4].link_type, 0)
	assert.strictEqual(arc.list[4].link, null)
	assert.strictEqual(arc.list[4].size, 0n)
	assert.strictEqual(arc.list[4].time, 1735689600)
	assert.strictEqual(arc.list[4].nsec, 0)
	assert.strictEqual(arc.list[4].x?.entry, 1)

	assert.strictEqual(arc.list[5].file_type, 3)
	assert.strictEqual(arc.list[5].full, "dir/file.txt")
	assert.strictEqual(arc.list[5].link_type, 0)
	assert.strictEqual(arc.list[5].link, null)
	assert.strictEqual(arc.list[5].size, 12n)
	assert.strictEqual(arc.list[5].time, 1735689600)
	assert.strictEqual(arc.list[5].nsec, 0)
	assert.strictEqual(arc.list[5].x?.entry, 1)

	assert.strictEqual(arc.list[6].file_type, 3)
	assert.strictEqual(arc.list[6].full, "file.txt")
	assert.strictEqual(arc.list[6].link_type, 0)
	assert.strictEqual(arc.list[6].link, null)
	assert.strictEqual(arc.list[6].size, 8n)
	assert.strictEqual(arc.list[6].time, 1735689600)
	assert.strictEqual(arc.list[6].nsec, 0)
	assert.strictEqual(arc.list[6].x?.entry, 1)

	assert.strictEqual(arc.list[7].file_type, 3)
	assert.strictEqual(arc.list[7].full, "🍋")
	assert.strictEqual(arc.list[7].link_type, 0)
	assert.strictEqual(arc.list[7].link, null)
	assert.strictEqual(arc.list[7].size, 4n)
	assert.strictEqual(arc.list[7].time, 1735689600)
	assert.strictEqual(arc.list[7].nsec, 0)
	assert.strictEqual(arc.list[7].x?.entry, 1)

	assert.strictEqual(arc.list[8].file_type, 3)
	assert.strictEqual(arc.list[8].full, "🍋‍🟩")
	assert.strictEqual(arc.list[8].link_type, 0)
	assert.strictEqual(arc.list[8].link, null)
	assert.strictEqual(arc.list[8].size, 11n)
	assert.strictEqual(arc.list[8].time, 1735689600)
	assert.strictEqual(arc.list[8].nsec, 0)
	assert.strictEqual(arc.list[8].x?.entry, 1)

	for (const error_path of ["", ".", "./", "..", "../"]) {
		await assert.rejects(
			async () => await native.getArchive(error_path, ""),
			(err) => err === ERROR.INVALID_PATH,
		)
	}

	{
		const entry1 = await native.getArchiveEntry(TAR, "file.txt")
		assert.strictEqual(entry1.size, 8n)
		const buf1 = await readStream(entry1.reader)
		assert.strictEqual(buf1.toString(), "file.txt")

		const entry2 = await native.getArchiveEntry(TAR, "dir/file.txt")
		assert.strictEqual(entry2.size, 12n)
		const buf2 = await readStream(entry2.reader)
		assert.strictEqual(buf2.toString(), "dir/file.txt")

		const entry3 = await native.getArchiveEntry(TAR, "🍋")
		assert.strictEqual(entry3.size, 4n)
		const buf3 = await readStream(entry3.reader)
		assert.strictEqual(buf3.toString(), "🍋")

		const entry4 = await native.getArchiveEntry(TAR, "🍋‍🟩")
		assert.strictEqual(entry4.size, 11n)
		const buf4 = await readStream(entry4.reader)
		assert.strictEqual(buf4.toString(), "🍋‍🟩")

		const entry5 = await native.getArchiveEntry(TAR, "🍋‍🟩", 7n)
		assert.strictEqual(entry5.size, 11n)
		const buf5 = await readStream(entry5.reader)
		assert.strictEqual(buf5.toString(), "🟩")
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
