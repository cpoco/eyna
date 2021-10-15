import * as path from 'path'

export default async (ex: Extension): Promise<void> => {
	let dir = await ex.dialog.opne({ type: "prompt", title: "mkdir", text: "new folder" })
	if (dir == null || dir.text == "") {
		return
	}

	let full = path.join(ex.active.wd, dir.text)

	if (await ex.filer.exists(full)) {
		await ex.dialog.opne({ type: "alert", title: "mkdir", text: "exists" })
		return
	}

	await ex.filer.mkdir(full)

	ex.filer.update()
}
