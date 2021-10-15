import * as path from 'path'

// const AttributeFileType = {
// 	directory: 1
// }

export default async (ex: Extension): Promise<void> => {
	if (ex.active.cursor == null) {
		return
	}

	let src = ex.active.cursor[0].full
	let dst = path.join(ex.target.wd, ex.active.cursor[0].rltv)

	let prompt = await ex.dialog.opne({ type: "prompt", title: "copy", text: dst })
	if (prompt == null || prompt.text == "") {
		return
	}
	dst = prompt.text

	if (await ex.filer.exists(dst)) {
		await ex.dialog.opne({ type: "alert", title: "copy", text: "exists" })
		return
	}

	console.log("\u001b[34m")

	await ex.filer.copy(`${src}`, `${dst}`)

	// if (ex.active.cursor[0].file_type == AttributeFileType.directory) {
	// 	console.log(`copy ${src}/ -> ${dst}/`)
	// 		let ls: string[] = await ex.filer.findcopy(src)
	// 	for(let p of ls) {
	// 		console.log(`copy ${src}/${p} -> ${dst}/${p}`)
	// 	}
	// }
	// else {
	// 	console.log(`copy ${src} -> ${dst}`)
	// }

	console.log("\u001b[0m")

	ex.filer.update()
}
