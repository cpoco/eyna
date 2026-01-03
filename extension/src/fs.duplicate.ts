import { dirname, join } from "node:path/posix"

const title = "duplicate"

module.exports = async (ex: Extension): Promise<void> => {
	if (ex.active === null || ex.active.cursor === null) {
		return
	}

	const src_base = ex.active.wd
	const dst_base = ex.active.wd
	const src_item = ex.active.cursor[0].rltv

	const prompt = await ex.dialog.open({
		type: "prompt",
		title: title,
		text: src_item,
		start: 0,
		end: src_item.length,
	})
	if (prompt === null || prompt.text === "") {
		return
	}

	const src = join(src_base, src_item)
	const dst = join(dst_base, prompt.text)

	if (
		src === dst
		|| dirname(src) !== dirname(dst)
		|| await ex.filer.exists(dst)
	) {
		return
	}

	await ex.filer.copy(src, dst)

	ex.filer.update()
}
