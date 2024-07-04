import { join } from "node:path/posix"

const title = "mkdir"

module.exports = async (ex: Extension): Promise<void> => {
	if (ex.active == null) {
		return
	}

	let text = "new directory"

	let dir = await ex.dialog.open({
		type: "prompt",
		title: title,
		text: text,
		start: 0,
		end: text.length,
	})
	if (dir == null || dir.text == "") {
		return
	}

	let full = join(ex.active.wd, dir.text)

	if (await ex.filer.exists(full)) {
		await ex.dialog.open({
			type: "alert",
			title: title,
			text: "exists",
		})
		return
	}

	await ex.filer.mkdir(full)

	ex.filer.update()
}
