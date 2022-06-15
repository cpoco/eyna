;(async (ex: Extension): Promise<void> => {
	log(ex.active.wd, ex.active.cursor, ...ex.active.select)
	if (ex.active.cursor == null) {
		return
	}
	let full = ex.active.cursor[0]!.full

	return new Promise(async (resolve, _reject) => {
		log("opne")
		ex.dialog.opne({ type: "alert", title: ex.active.wd, text: "cancel test" })
			.then(async () => {
				log("then")
				let alert = await ex.dialog.opne({ type: "alert", title: ex.active.wd, text: "alert message" })
				log(alert)
				let prompt = await ex.dialog.opne({ type: "prompt", title: ex.active.wd, text: full })
				log(prompt)
				log("update")
				ex.filer.update()
				resolve()
			})
		log("cancel")
		ex.dialog.cancel()
	})
})
