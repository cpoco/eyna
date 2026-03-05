import child_process, { type IOType } from "node:child_process"
import fs from "node:fs"
import path from "node:path"

const __top = path.join(import.meta.dirname, "..")
const __cache_vcpkg_archives = path.join(__top, "..", "..", "cache", "vcpkg", "archives")
const __cache_vcpkg_downloads = path.join(__top, "..", "..", "cache", "vcpkg", "downloads")

export async function install(stdout: IOType = "ignore") {
	await fs.promises.mkdir(__cache_vcpkg_archives, { recursive: true })
	await fs.promises.mkdir(__cache_vcpkg_downloads, { recursive: true })

	return new Promise<void>((resolve, reject) => {
		child_process.spawn(
			"vcpkg",
			[
				"install",
				"--triplet",
				`${process.platform}-${process.arch}`,
				// "--debug",
			],
			{
				stdio: ["ignore", stdout, "inherit"],
				cwd: path.join(__top),
				env: {
					...process.env,
					VCPKG_DOWNLOADS: __cache_vcpkg_downloads,
					VCPKG_DEFAULT_BINARY_CACHE: __cache_vcpkg_archives,
					VCPKG_OVERLAY_PORTS: path.join(__top, "ports"),
					VCPKG_OVERLAY_TRIPLETS: path.join(__top, "triplets"),
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

export async function status(): Promise<Record<string, string>> {
	const file = path.join(__top, "vcpkg_installed", "vcpkg", "status")
	const data = await fs.promises.readFile(file, "utf-8")

	const status: Record<string, string> = {}
	const items = data.split("\n\n")

	for (const item of items) {
		const lines = item.split("\n")

		let pkg: string | null = null
		let ver: string | null = null

		for (const line of lines) {
			if (line.indexOf("Package: ") === 0) {
				pkg = line.slice("Package: ".length).trim()
			}
			else if (line.indexOf("Version: ") === 0) {
				ver = line.slice("Version: ".length).trim()
			}
		}

		if (pkg && ver) {
			status[pkg] = ver
		}
	}

	const sorted: Record<string, string> = {}
	for (const key of Object.keys(status).sort()) {
		sorted[key] = status[key]
	}

	return sorted
}
