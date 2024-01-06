// import { basename, dirname, join, normalize } from "node:path/posix"
;(async (ex: Extension): Promise<void> => {
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

	const base = ex.active.wd
	for (const v of ls) {
		if (v[0]!.file_type == 1) {
			const dir = await ex.filer.find(v[0]!.full, ex.active.wd)
			for (const v of dir.list) {
				log(v.type, base, v.rltv)
			}
		}
		log(v[0]!.file_type, base, v[0]!.rltv)
	}
})
