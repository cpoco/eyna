export default async (ex: Extension): Promise<void> => {
	console.log(ex.active.wd, ex.active.cursor, ...ex.active.select)
	if (ex.active.cursor == null) {
		return
	}
	let full = ex.active.cursor[0].full

	return new Promise(async (resolve, _reject) => {
		console.log("opne")
		ex.dialog.opne({ type: "alert", title: ex.active.wd, text: "cancel test" })
			.then(async () => {
				console.log("then")
				let alert = await ex.dialog.opne({ type: "alert", title: ex.active.wd, text: "alert message" })
				console.log(alert)
				let prompt = await ex.dialog.opne({ type: "prompt", title: ex.active.wd, text: full })
				console.log(prompt)
				console.log("update")
				ex.filer.update()
				resolve()
			})
		console.log("cancel")
		ex.dialog.cancel()
	})
}
