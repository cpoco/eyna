import { dirname, join, normalize } from "node:path/posix"
;(async (ex: Extension): Promise<void> => {
	if (ex.active == null || ex.target == null || ex.active.cursor == null) {
		return
	}

	if (ex.active.select.length == 0) {
		let src = ex.active.cursor[0]!.full
		let dst = join(ex.target.wd, ex.active.cursor[0]!.rltv)

		let e = dst.length
		let s = e - ex.active.cursor[0]!.rltv.length

		let prompt = await ex.dialog.opne({ type: "prompt", title: "copy", text: dst, start: s, end: e })
		if (prompt == null || prompt.text == "") {
			return
		}
		dst = prompt.text

		if (await ex.filer.exists(dst)) {
			await ex.dialog.opne({ type: "alert", title: "copy", text: "exists" })
			return
		}

		let dirdst = dirname(normalize(dst))
		if (!await ex.filer.exists(dirdst)) {
			await ex.filer.mkdir(dirdst)
		}

		await ex.filer.copy(src, dst)
	}
	else {
		await ex.dialog.opne({ type: "alert", title: "copy", text: "select copy is unimplemented" })
		return
	}

	ex.filer.update()
})
