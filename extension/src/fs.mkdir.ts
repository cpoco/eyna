import { join } from "node:path/posix"

const title = "mkdir"

module.exports = async (ex: Extension): Promise<void> => {
	if (ex.active == null) {
		return
	}

	let txet = "new directory"

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

	await ex.filer.mkdir(full)

	ex.filer.update()
}
