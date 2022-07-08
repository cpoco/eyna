;(async (ex: Extension): Promise<void> => {
	if (ex.active == null || ex.active.cursor == null) {
		return
	}

	if (ex.active.select.length == 0) {
		let alert = await ex.dialog.opne({ type: "alert", title: "trash", text: ex.active.cursor[0]!.full })

		if (alert != null) {
			await ex.filer.trash(ex.active.cursor[0]!.full)
		}
	}
	else {
		let alert = await ex.dialog.opne({ type: "alert", title: "trash", text: `${ex.active.select.length} files` })

		if (alert != null) {
			for (let i = 0; i < ex.active.select.length; i++) {
				await ex.filer.trash(ex.active.select[i]![0]!.full)
			}
		}
	}

	ex.filer.update()
})
