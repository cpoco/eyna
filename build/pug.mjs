import fs from "fs/promises"
import path from "path"
import url from "url"

import * as pug from "pug"

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

async function render(file) {
	return new Promise((resolve, reject) => {
		try {
			resolve(pug.renderFile(file))
		}
		catch(err) {
			reject(err)
		}
	})
}

export async function Build() {
	return render(path.join(__dirname, "../src/app/index.pug"))
		.then((html) => {
			return fs.writeFile(path.join(__dirname, "../app/index.html"), html)
		})
}
