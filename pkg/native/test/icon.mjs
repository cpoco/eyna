import fs from "node:fs/promises"
import path from "node:path"
import url from "node:url"
const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

import module from "node:module"
const require = module.createRequire(import.meta.url)
const native = require(path.join(__dirname, "../build/Release/native.node"))

native.getIcon(__dirname)
	.then(async (data) => {
		console.log(data)
		await fs.writeFile("dirname.png", data)
	})
