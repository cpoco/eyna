import child_process, { type IOType } from "node:child_process"
import fs from "node:fs"
import path from "node:path"

const __top = path.join(import.meta.dirname ?? __dirname, "..")
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
