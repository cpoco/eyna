import fs from "node:fs/promises"
import path from "node:path"
import url from "node:url"
import stylus from "stylus"

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const __top = path.join(__dirname, "..")

const file = path.join(__top, "src/app/style.styl")
const out = path.join(__top, "app/style.css")

async function render(str) {
	return new Promise((resolve, reject) => {
		stylus(str)
			.set("paths", [
				path.join(__top, "src/app"),
			])
			.render(
				(err, css) => {
					if (err) {
						reject(err)
					}
					else {
						resolve(css)
					}
				},
			)
	})
}

export async function Build() {
	return fs.readFile(file)
		.then((buff) => {
			return render(buff.toString())
		})
		.then((css) => {
			return fs.writeFile(out, css)
		})
}
