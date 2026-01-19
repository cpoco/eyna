const join = require("node:path/posix").join

const title = "mkslink"

module.exports = async (ex: Extension): Promise<void> => {
	if (ex.active === null || ex.active.cursor === null) {
		return
	}
	const full = ex.active.cursor[0].full

	const text = "new link"

	const prompt = await ex.dialog.open({
		type: "prompt",
		title: title,
		text: text,
		start: 0,
		end: text.length,
	})
	if (prompt === null || prompt.text === "") {
		return
	}

	const link = join(ex.active.wd, prompt.text)

	if (await ex.filer.exists(link)) {
		await ex.dialog.open({
			type: "alert",
			title: title,
			text: "exists",
		})
		return
	}

	await ex.filer.mkslink(link, full)

	ex.filer.update()
}
