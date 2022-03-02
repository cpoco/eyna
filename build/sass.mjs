import fs from "fs/promises"
import path from "path"
import sass from "sass"
import url from "url"

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const file = path.join(__dirname, "../src/app/style.sass")
const out = path.join(__dirname, "../app/style.css")

export async function Build() {
	return sass.compileAsync(file, { style: "compressed" })
		.then((result) => {
			return fs.writeFile(out, result.css)
		})
}
