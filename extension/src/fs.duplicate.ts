import { dirname, join, normalize } from "node:path/posix"

module.exports = async (ex: Extension): Promise<void> => {
	if (ex.active == null || ex.active.cursor == null) {
		return
	}

	let src = ex.active.cursor[0]!.full
	let dst = join(ex.active.wd, ex.active.cursor[0]!.rltv)

	let e = dst.length
	let s = e - ex.active.cursor[0]!.rltv.length

	let prompt = await ex.dialog.opne({ type: "prompt", title: "duplicate", text: dst, start: s, end: e })
	if (prompt == null || prompt.text == "") {
		return
	}
	dst = prompt.text

	if (await ex.filer.exists(dst)) {
		await ex.dialog.opne({ type: "alert", title: "duplicate", text: "exists" })
		return
	}

	let dirdst = dirname(normalize(dst))
	if (!await ex.filer.exists(dirdst)) {
		await ex.filer.mkdir(dirdst)
	}

	await ex.filer.copy(src, dst)

	ex.filer.update()
}
