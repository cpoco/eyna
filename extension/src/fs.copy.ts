import * as path from "node:path/posix"
; (async (ex: Extension): Promise<void> => {
	if (ex.active == null || ex.target == null || ex.active.cursor == null) {
		return
	}
	if (ex.active.wd == ex.target.wd) {
		await ex.dialog.opne({ type: "alert", title: "copy", text: "same directory" })
		return
	}

	const ls: Attributes[] = ex.active.select.length == 0
		? [ex.active.cursor]
		: ex.active.select

	const src_base = ex.active.wd
	const dst_base = ex.target.wd

	for (const v of ls) {
		if (v[0]!.file_type == AttributeFileType.directory) {
			const find = await ex.filer.find(v[0]!.full, src_base)
			for (const w of find.list) {
				operation(ex, w, src_base, dst_base)
			}
		}
		operation(ex, { type: v[0]!.file_type, rltv: v[0]!.rltv }, src_base, dst_base)
	}
})

async function operation(_ex: Extension, item: Item, src_base: string, dst_base: string): Promise<void> {
	const base = item.type == AttributeFileType.directory
		? item.rltv
		: path.dirname(item.rltv)

	const file = item.type == AttributeFileType.directory
		? ""
		: path.basename(item.rltv)

	log({
		src: src_base,
		dst: dst_base,
		type: item.type,
		base: base,
		file: file,
	})
}

enum AttributeFileType {
	directory = 1,
}