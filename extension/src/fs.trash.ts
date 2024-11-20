const title = "trash"

module.exports = async (ex: Extension): Promise<void> => {
	if (ex.active == null || ex.active.cursor == null) {
		return
	}

	if (ex.active.select.length == 0) {
		const alert = await ex.dialog.open({
			type: "alert",
			title: title,
			text: ex.active.cursor[0]!.full,
		})

		if (alert != null) {
			await ex.filer.trash(ex.active.cursor[0]!.full)
		}
	}
	else {
		const alert = await ex.dialog.open({
			type: "alert",
			title: title,
			text: `${ex.active.select.length} files`,
		})

		if (alert != null) {
			for (const v of ex.active.select) {
				await ex.filer.trash(v[0]!.full)
			}
		}
	}

	ex.filer.update()
}
