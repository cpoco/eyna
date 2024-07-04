import { join } from "node:path/posix"

const title = "copy"

module.exports = async (ex: Extension): Promise<void> => {
	if (ex.active == null || ex.target == null || ex.active.cursor == null) {
		return
	}
	if (ex.active.wd == ex.target.wd) {
		await ex.dialog.open({
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

	const alert = await ex.dialog.open({
		type: "alert",
		title: title,
		text: `${ls.length} files\n${src_base}\n${dst_base}`,
	})
	if (alert == null) {
		return
	}

	for (const v of ls) {
		await operation(ex, { type: v[0]!.file_type, rltv: v[0]!.rltv }, src_base, dst_base)
	}

	ex.filer.update()
}

async function operation(ex: Extension, item: Item, src_base: string, dst_base: string): Promise<void> {
	const src = join(src_base, item.rltv)
	const dst = join(dst_base, item.rltv)

	if (!await ex.filer.exists(dst_base) || await ex.filer.exists(dst)) {
		return
	}

	await ex.filer.copy(src, dst)
}
