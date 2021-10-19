import * as path from 'path'

export default async (ex: Extension): Promise<void> => {
	if (ex.active.cursor == null) {
		return
	}

	let src = ex.active.cursor[0].full
	let dst = path.join(ex.target.wd, ex.active.cursor[0].rltv)

	let prompt = await ex.dialog.opne({ type: "prompt", title: "move", text: dst })
	if (prompt == null || prompt.text == "") {
		return
	}
	dst = prompt.text

	if (await ex.filer.exists(dst)) {
		await ex.dialog.opne({ type: "alert", title: "move", text: "exists" })
		return
	}

	let dirdst = path.dirname(path.posix.normalize(dst))
	if (!await ex.filer.exists(dirdst)) {
		await ex.filer.mkdir(dirdst)
	}

	await ex.filer.move(src, dst)

	ex.filer.update()
}
