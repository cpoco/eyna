import fs from "node:fs"
import path from "node:path"
import stream from "node:stream/promises"
import zlib from "node:zlib"
import * as tar from "tar"

const __top = path.join(import.meta.dirname ?? __dirname, "..")
const __cache = path.join(__top, "cache")

const runtimeBase: Record<string, string> = {
	node: "https://nodejs.org/dist",
	electron: "https://artifacts.electronjs.org/headers/dist",
}

export async function headers(runtime: "node" | "electron", version: string) {
	if (!(runtime in runtimeBase)) {
		throw new Error("unsupported runtime")
	}

	const outDir = path.join(__cache, `${runtime}-${version}`)
	fs.rmSync(outDir, { recursive: true, force: true })
	fs.mkdirSync(outDir, { recursive: true })

	const tarUrl = `${runtimeBase[runtime]}/v${version}/node-v${version}-headers.tar.gz`

	try {
		console.log("http", "GET", tarUrl)
		const response = await fetch(tarUrl)

		if (!response.ok || !response.body) {
			throw new Error("download failed")
		}

		await stream.pipeline(
			response.body,
			zlib.createGunzip(),
			tar.extract({
				cwd: outDir,
				strip: 1,
				// onentry: (entry) => {
				// 	console.log("verb", "extracted", entry.path)
				// },
			}),
		)
	}
	catch (error) {
		throw error
	}

	// windows node.lib
	if (process.platform != "win32") {
		return
	}

	const winArch = `win-${process.arch}`
	const libUrl = `${runtimeBase[runtime]}/v${version}/${winArch}/node.lib`
	const libOut = path.join(outDir, winArch, "node.lib")

	fs.mkdirSync(path.dirname(libOut), { recursive: true })

	try {
		console.log("http", "GET", libUrl)
		const libResponse = await fetch(libUrl)

		if (!libResponse.ok || !libResponse.body) {
			throw new Error("download failed")
		}

		await stream.pipeline(
			libResponse.body,
			fs.createWriteStream(libOut),
		)
	}
	catch (error) {
		throw error
	}
}
