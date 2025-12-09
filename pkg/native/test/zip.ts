import * as native from "@eyna/native/lib/browser.ts"

import assert from "node:assert"
import path from "node:path/posix"

const main = async () => {
	const zip = path.join(import.meta.dirname ?? __dirname, "fixtures", "test.zip")
	const arc = await native.getArchive(zip, "", 10)

	console.log(arc)

	assert(arc.s == 35n)
	assert(arc.d == 5)
	assert(arc.f == 4)
	assert(arc.e == 0)

	assert(arc.list.length == 9)

	assert(arc.list[0].file_type == 1)
	assert(arc.list[0].full == "dir/")
	assert(arc.list[0].size == 0n)
	assert(arc.list[0].time == 1735689600 && arc.list[3].nsec == 0)

	assert(arc.list[1].file_type == 1)
	assert(arc.list[1].full == "dir/dir")
	assert(arc.list[1].size == 0n)
	assert(arc.list[1].time == 0 && arc.list[5].nsec == 0)

	assert(arc.list[2].file_type == 1)
	assert(arc.list[2].full == "dir/dir/dir")
	assert(arc.list[2].size == 0n)
	assert(arc.list[2].time == 0 && arc.list[5].nsec == 0)

	assert(arc.list[3].file_type == 1)
	assert(arc.list[3].full == "dir/dir/dir/dir")
	assert(arc.list[3].size == 0n)
	assert(arc.list[3].time == 0 && arc.list[5].nsec == 0)

	assert(arc.list[4].file_type == 1)
	assert(arc.list[4].full == "dir/dir/dir/dir/dir/")
	assert(arc.list[4].size == 0n)
	assert(arc.list[4].time == 1735689600 && arc.list[5].nsec == 0)

	assert(arc.list[5].file_type == 3)
	assert(arc.list[5].full == "dir/file.txt")
	assert(arc.list[5].size == 12n)
	assert(arc.list[5].time == 1735689600 && arc.list[4].nsec == 0)

	assert(arc.list[6].file_type == 3)
	assert(arc.list[6].full == "file.txt")
	assert(arc.list[6].size == 8n)
	assert(arc.list[6].time == 1735689600 && arc.list[2].nsec == 0)

	assert(arc.list[7].file_type == 3)
	assert(arc.list[7].full == "🍋")
	assert(arc.list[7].size == 4n)
	assert(arc.list[7].time == 1735689600 && arc.list[0].nsec == 0)

	assert(arc.list[8].file_type == 3)
	assert(arc.list[8].full == "🍋‍🟩")
	assert(arc.list[8].size == 11n)
	assert(arc.list[8].time == 1735689600 && arc.list[1].nsec == 0)
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
