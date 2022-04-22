import fs from "node:fs/promises"
import path from "node:path"
import url from "node:url"
import * as pug from "pug"

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const file = path.join(__dirname, "../src/app/index.pug")
const out = path.join(__dirname, "../app/index.html")

export async function Build() {
	return new Promise((resolve, _) => {
		resolve(fs.writeFile(out, pug.renderFile(file)))
	})
}
