import fse from "fs-extra"
import path from "node:path"
import * as pug from "pug"

const __top = path.join(import.meta.dirname, "..")
const __build = path.join(__top, "build")

const outdir = path.join(__build, "app")
const file = path.join(__top, "src/app/index.pug")
const out = path.join(outdir, "index.html")

export async function Build() {
	await fse.ensureDir(outdir)
	return fse.writeFile(out, pug.renderFile(file))
}
