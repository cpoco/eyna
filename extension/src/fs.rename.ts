import * as path from "node:path/posix"

const title = "rename"

module.exports = async (ex: Extension): Promise<void> => {
	if (ex.active == null || ex.active.cursor == null) {
		return
	}

	const src_base = ex.active.wd
	const dst_base = ex.active.wd
	const src_item = ex.active.cursor[0]!.rltv

	const prompt = await ex.dialog.opne({
		type: "prompt",
		title: title,
		text: src_item,
		start: 0,
		end: src_item.length,
	})
	if (prompt == null || prompt.text == "") {
		return
	}

	const src = path.join(src_base, src_item)
	const dst = path.join(dst_base, prompt.text)

	if (
		src == dst
		|| path.dirname(src) != path.dirname(dst)
		|| await ex.filer.exists(dst)
	) {
		return
	}

	await ex.filer.move(src, dst)

	ex.filer.update()
}
