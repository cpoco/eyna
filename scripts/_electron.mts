import fs from "node:fs"
import path from "node:path"
import stream from "node:stream/promises"

const __top = path.join(import.meta.dirname, "..")
const __cache = path.join(__top, "cache")

const base = "https://github.com/electron/electron/releases/download"

export async function download(version: string, fresh: boolean = false): Promise<void> {
	const outDir = path.join(__cache, "dist")

	if (fresh) {
		await fs.promises.rm(outDir, { recursive: true, force: true })
	}
	else if (fs.existsSync(outDir)) {
		return
	}

	await fs.promises.mkdir(outDir, { recursive: true })

	const zip = `electron-v${version}-${process.platform}-${process.arch}.zip`
	const zipUrl = `${base}/v${version}/${zip}`
	const zipOut = path.join(outDir, zip)

	try {
		console.log("http", "GET", zipUrl)
		const response = await fetch(zipUrl, {
			redirect: "follow",
		})

		if (!response.ok || !response.body) {
			throw new Error("download failed")
		}

		await stream.pipeline(
			response.body,
			fs.createWriteStream(zipOut),
		)
	}
	catch (error) {
		throw error
	}
}
