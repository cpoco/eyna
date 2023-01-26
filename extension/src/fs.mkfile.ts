import { join } from "node:path"
;(async (ex: Extension): Promise<void> => {
	if (ex.active == null) {
		return
	}

	let dir = await ex.dialog.opne({ type: "prompt", title: "mkfile", text: "new file" })
	if (dir == null || dir.text == "") {
		return
	}

	let full = join(ex.active.wd, dir.text)

	if (await ex.filer.exists(full)) {
		await ex.dialog.opne({ type: "alert", title: "mkfile", text: "exists" })
		return
	}

	await ex.filer.mkfile(full)

	ex.filer.update()
})