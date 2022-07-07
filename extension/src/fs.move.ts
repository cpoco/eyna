import { dirname, join } from "node:path"
import { normalize } from "node:path/posix"
;(async (ex: Extension): Promise<void> => {
	if (ex.active.cursor == null) {
		return
	}

	if (ex.active.select.length == 0) {
		let src = ex.active.cursor[0]!.full
		let dst = join(ex.target.wd, ex.active.cursor[0]!.rltv)

		let prompt = await ex.dialog.opne({ type: "prompt", title: "move", text: dst })
		if (prompt == null || prompt.text == "") {
			return
		}
		dst = prompt.text

		if (await ex.filer.exists(dst)) {
			await ex.dialog.opne({ type: "alert", title: "move", text: "exists" })
			return
		}

		let dirdst = dirname(normalize(dst))
		if (!await ex.filer.exists(dirdst)) {
			await ex.filer.mkdir(dirdst)
		}

		await ex.filer.move(src, dst)
	}
	else {
		await ex.dialog.opne({ type: "alert", title: "move", text: "select move is unimplemented" })
		return
	}

	ex.filer.update()
})
