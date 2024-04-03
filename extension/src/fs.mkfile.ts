import { join } from "node:path/posix"
import { Extension } from "./_type"

const title = "mkfile"

module.exports = async (ex: Extension): Promise<void> => {
	if (ex.active == null) {
		return
	}

	let txet = "new file"

	let dir = await ex.dialog.opne({
		type: "prompt",
		title: title,
		text: txet,
		start: 0,
		end: txet.length,
	})
	if (dir == null || dir.text == "") {
		return
	}

	let full = join(ex.active.wd, dir.text)

	if (await ex.filer.exists(full)) {
		await ex.dialog.opne({
			type: "alert",
			title: title,
			text: "exists",
		})
		return
	}

	await ex.filer.mkfile(full)

	ex.filer.update()
}
