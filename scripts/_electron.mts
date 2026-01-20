import fs from "node:fs"
import path from "node:path"
import stream from "node:stream/promises"

const __top = path.join(import.meta.dirname, "..")
const __dist = path.join(__top, "dist")

const base = "https://github.com/electron/electron/releases/download"

export async function download(version: string, fresh: boolean = false): Promise<void> {
	const zip = `electron-v${version}-${process.platform}-${process.arch}.zip`
	const outZip = path.join(__dist, zip)

	await fs.promises.mkdir(__dist, { recursive: true })

	if (fresh) {
		await fs.promises.rm(outZip, { recursive: true, force: true })
	}
	else if (fs.existsSync(outZip)) {
		return
	}

	const url = `${base}/v${version}/${zip}`

	try {
		console.log("http", "GET", url)
		const response = await fetch(url, {
			redirect: "follow",
		})

		if (!response.ok || !response.body) {
			throw new Error("download failed")
		}

		await stream.pipeline(
			response.body,
			fs.createWriteStream(outZip),
		)
	}
	catch (error) {
		throw error
	}
}
