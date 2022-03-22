import fs from "fs/promises"
import path from "path"
import * as pug from "pug"
import url from "url"

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const file = path.join(__dirname, "../src/app/index.pug")
const out = path.join(__dirname, "../app/index.html")

export async function Build() {
	return new Promise((resolve, _) => {
		resolve(fs.writeFile(out, pug.renderFile(file)))
	})
}
