import fs from "node:fs/promises"
import path from "node:path"
import url from "node:url"
import * as pug from "pug"

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const __top = path.join(__dirname, "..")

const file = path.join(__top, "src/app/index.pug")
const out = path.join(__top, "app/index.html")

export async function Build() {
	return new Promise((resolve, _) => {
		resolve(fs.writeFile(out, pug.renderFile(file)))
	})
}
