// import { AttributeFileType } from "@eyna/native/ts/_type"
import * as path from "node:path/posix"
import { Attributes, Extension, Item } from "./_type"

const title = "move"

module.exports = async (ex: Extension): Promise<void> => {
	if (ex.active == null || ex.target == null || ex.active.cursor == null) {
		return
	}
	if (ex.active.wd == ex.target.wd) {
		await ex.dialog.opne({
			type: "alert",
			title: title,
			text: "same directory",
		})
		return
	}

	const src_base = ex.active.wd
	const dst_base = ex.target.wd
	const ls: Attributes[] = ex.active.select.length == 0
		? [ex.active.cursor]
		: ex.active.select

	const alert = await ex.dialog.opne({
		type: "alert",
		title: title,
		text: `${ls.length} files\n${src_base}\n${dst_base}`,
	})
	if (alert == null) {
		return
	}

	for (const v of ls) {
		await operation(ex, { type: v[0]!.file_type, rltv: v[0]!.rltv }, src_base, dst_base)
		/*
		if (v[0]!.file_type == AttributeFileType.directory) {
			const find = await ex.filer.find(v[0]!.full, src_base)
			for (const w of find.list) {
				await operation_test(ex, w, src_base, dst_base)
			}
		}
		await operation_test(ex, { type: v[0]!.file_type, rltv: v[0]!.rltv }, src_base, dst_base)
		*/
	}

	ex.filer.update()
}

async function operation(ex: Extension, item: Item, src_base: string, dst_base: string): Promise<void> {
	const src = path.join(src_base, item.rltv)
	const dst = path.join(dst_base, item.rltv)

	if (!await ex.filer.exists(dst_base) || await ex.filer.exists(dst)) {
		return
	}

	await ex.filer.move(src, dst)
}

/*
async function operation_test(_ex: Extension, item: Item, src_base: string, dst_base: string): Promise<void> {
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
*/
