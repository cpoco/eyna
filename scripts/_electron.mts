import fs from "node:fs"
import path from "node:path"
import stream from "node:stream/promises"

import extractZip from "@electron-internal/extract-zip"

const __top = path.join(import.meta.dirname, "..")
const __cache = path.join(__top, "cache")

const base = "https://github.com/electron/electron/releases/download"

function zipName(version: string): string {
	return `electron-v${version}-${process.platform}-${process.arch}.zip`
}

function cacheDir(version: string): string {
	return path.join(__cache, `electron-${version}`)
}

export function ExecPath(version: string): string {
	if (process.platform === "win32") {
		return path.join(cacheDir(version), "bin", "electron.exe")
	}
	else if (process.platform === "darwin") {
		return path.join(cacheDir(version), "bin", "Electron.app", "Contents", "MacOS", "Electron")
	}
	throw new Error("unsupported os")
}

export async function Download(version: string, fresh: boolean = false): Promise<void> {
	const outDir = cacheDir(version)
	const zipOut = path.join(outDir, zipName(version))

	if (fresh) {
		await fs.promises.rm(zipOut, { force: true })
	}
	else if (fs.existsSync(zipOut)) {
		return
	}

	await fs.promises.mkdir(outDir, { recursive: true })

	const zipUrl = `${base}/v${version}/${zipName(version)}`

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

export async function Extract(version: string, fresh: boolean = false): Promise<void> {
	const extractDir = path.join(cacheDir(version), "bin")

	if (fresh) {
		await fs.promises.rm(extractDir, { recursive: true, force: true })
	}
	else if (fs.existsSync(extractDir)) {
		return
	}

	const zipOut = path.join(cacheDir(version), zipName(version))
	await extractZip(zipOut, { dir: extractDir })
}
