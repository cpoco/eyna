export default async (ex: Extension): Promise<void> => {
	if (ex.active.cursor == null) {
		return
	}
	let full = ex.active.cursor[0].full

	let alert = await ex.dialog.opne({ type: "alert", title: "trash", text: full })

	if (alert != null) {
		await ex.filer.trash(full)
	}

	ex.filer.update()
}
