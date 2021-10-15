export default async (ex: Extension): Promise<void> => {
	console.log(ex.active.wd, ex.active.cursor, ...ex.active.select)
	if (ex.active.cursor == null) {
		return
	}
	let full = ex.active.cursor[0].full

	let alert = await ex.dialog.opne({ type: "alert", title: ex.active.wd, text: "alert message" })
	console.log(alert)

	let prompt = await ex.dialog.opne({ type: "prompt", title: ex.active.wd, text: full })
	console.log(prompt)
}
