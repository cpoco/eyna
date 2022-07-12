import fse from "fs-extra"
import * as pug from "pug"
import path from "node:path"
import url from "node:url"

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const __top = path.join(__dirname, "..")
const __build = path.join(__top, "build")

const outdir = path.join(__build, "app")
const file = path.join(__top, "src/app/index.pug")
const out = path.join(outdir, "index.html")

export async function Build() {
	await fse.ensureDir(outdir)
	return fse.writeFile(out, pug.renderFile(file))
}
