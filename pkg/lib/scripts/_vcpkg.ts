import child_process from "node:child_process"
import fs from "node:fs"
import path from "node:path"

const __top = path.join(import.meta.dirname ?? __dirname, "..")
const __cache = path.join(__top, "cache")

export function install() {
	fs.mkdirSync(__cache, { recursive: true })

	child_process.spawnSync(
		"vcpkg",
		[
			"install",
			"--triplet",
			`${process.platform}-${process.arch}`,
			// "--debug",
		],
		{
			stdio: "inherit",
			cwd: path.join(__top),
			env: {
				...process.env,
				VCPKG_DEFAULT_BINARY_CACHE: __cache,
				VCPKG_OVERLAY_PORTS: path.join(__top, "ports"),
				VCPKG_OVERLAY_TRIPLETS: path.join(__top, "triplets"),
			},
		},
	)
}
