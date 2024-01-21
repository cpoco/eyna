import { Extension } from "./_type"

module.exports = async (ex: Extension): Promise<void> => {
	if (ex.active == null) {
		return
	}

	log(ex.active.wd, ex.active.cursor, ...ex.active.select)
	if (ex.active.cursor == null) {
		return
	}
	let full = ex.active.cursor[0]!.full

	return new Promise(async (resolve, _reject) => {
		ex.dialog.opne({ type: "alert", title: ex.active!.wd, text: "cancel test" })
			.then(async () => {
				await ex.dialog.opne({ type: "alert", title: ex.active!.wd, text: "alert message" })
				await ex.dialog.opne({ type: "prompt", title: ex.active!.wd, text: full })
				ex.filer.update()
				resolve()
			})
		ex.dialog.cancel()
	})
}
