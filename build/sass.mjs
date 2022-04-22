import fs from "node:fs/promises"
import path from "node:path"
import url from "node:url"
import sass from "sass"

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const file = path.join(__dirname, "../src/app/style.sass")
const out = path.join(__dirname, "../app/style.css")

export async function Build() {
	return sass.compileAsync(file, { style: "compressed" })
		.then((result) => {
			return fs.writeFile(out, result.css)
		})
}
