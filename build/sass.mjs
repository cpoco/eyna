import fs from "fs/promises"
import path from "path"
import sass from "sass"
import url from "url"

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

async function render(file) {
	return new Promise((resolve, reject) => {
		sass.render({
			file: file,
			outputStyle: "compressed",
		}, (err, result) => {
			if (err) {
				reject(err)
			}
			else {
				resolve(result.css)
			}
		})
	})
}

export async function Build() {
	return render(path.join(__dirname, "../src/app/style.sass"))
		.then((css) => {
			return fs.writeFile(path.join(__dirname, "../app/style.css"), css)
		})
}
