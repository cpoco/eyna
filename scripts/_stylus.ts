/// <reference types="./types.d.ts" />

import fs from "node:fs/promises"
import path from "node:path"
import stylus from "stylus"

const __top = path.join(import.meta.dirname ?? __dirname, "..")
const __build = path.join(__top, "build")

const outdir = path.join(__build, "app")
const file = path.join(__top, "src/app/style.styl")
const out = path.join(outdir, "style.css")

async function render(str: string): Promise<string> {
	return new Promise((resolve, reject) => {
		stylus(str)
			.set("paths", [
				path.join(__top, "src/app"),
			])
			.render(
				(err: Error, css: string) => {
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
	await fs.mkdir(outdir, { recursive: true })
	return fs.readFile(file)
		.then((buff) => {
			return render(buff.toString())
		})
		.then((css) => {
			return fs.writeFile(out, css)
		})
}
