import native from "@eyna/native/esm/index.mjs"
import fs from "node:fs/promises"
import path from "node:path"
import url from "node:url"
const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

native.getIcon(__dirname)
	.then(async (data) => {
		console.log(data)
		await fs.writeFile("dirname.png", data)
	})
