import child_process from "node:child_process"
import fs from "node:fs"
import path from "node:path"

const __top = path.join(import.meta.dirname ?? __dirname, "..")
const __cache = path.join(__top, "cache", "dprint")

export async function fmt(cachedir: string): Promise<void> {
	return new Promise<void>((resolve, reject) => {
		child_process.spawn(
			"dprint",
			[
				"fmt",
			],
			{
				stdio: ["ignore", "inherit", "inherit"],
				cwd: __top,
				env: {
					...process.env,
					DPRINT_CACHE_DIR: cachedir,
				},
			},
		)
			.on("close", (code, signal) => {
				if (code === 0) {
					resolve()
				}
				else if (signal) {
					reject(new Error(`signal ${signal}`))
				}
				else {
					reject(new Error(`exit code ${code}`))
				}
			})
			.on("error", (err) => {
				reject(err)
			})
	})
}

Promise.resolve()
	.then(() => {
		return fs.promises.mkdir(__cache, { recursive: true })
	})
	.then(() => {
		return fmt(__cache)
	})
	.catch((err) => {
		console.error(err)
		process.exit(1)
	})
