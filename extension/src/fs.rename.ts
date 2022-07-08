import { dirname, join } from "node:path"
import { normalize } from "node:path/posix"
;(async (ex: Extension): Promise<void> => {
	if (ex.active == null || ex.active.cursor == null) {
		return
	}

	let src = ex.active.cursor[0]!.full
	let dst = join(ex.active.wd, ex.active.cursor[0]!.rltv)

	let prompt = await ex.dialog.opne({ type: "prompt", title: "rename", text: dst })
	if (prompt == null || prompt.text == "") {
		return
	}
	dst = prompt.text

	if (src.toLocaleLowerCase() != dst.toLocaleLowerCase() && await ex.filer.exists(dst)) {
		await ex.dialog.opne({ type: "alert", title: "rename", text: "exists" })
		return
	}

	let dirdst = dirname(normalize(dst))
	if (!await ex.filer.exists(dirdst)) {
		await ex.filer.mkdir(dirdst)
	}

	await ex.filer.move(src, dst)

	ex.filer.update()
})
