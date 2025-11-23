import child_process, { type IOType } from "node:child_process"
import fs from "node:fs"
import path from "node:path"

const __top = path.join(import.meta.dirname ?? __dirname, "..")
const __build = path.join(__top, "build")

fs.rmSync(__build, { recursive: true, force: true })
fs.mkdirSync(__build, { recursive: true })

export function cmake(name: "node" | "electron", version: string, stdout: IOType = "ignore"): string {
	child_process.spawnSync(
		"cmake",
		[
			"--fresh",

			`-DVCPKG_TRIPLET=${process.platform}-${process.arch}`,
			`-DNODE_RUNTIME_NAME=${name}`,
			`-DNODE_RUNTIME_VERSION=${version}`,

			...(process.platform == "darwin"
				? [
					"-G",
					"Ninja Multi-Config",
				]
				: []),

			"..",
		],
		{
			stdio: ["ignore", stdout, "inherit"],
			cwd: __build,
		},
	)

	child_process.spawnSync(
		"cmake",
		[
			"--build",
			".",

			"--config",
			"Release",

			"--target",
			"clean",

			"--verbose",
		],
		{
			stdio: ["ignore", stdout, "inherit"],
			cwd: __build,
		},
	)

	child_process.spawnSync(
		"cmake",
		[
			"--build",
			".",

			"--config",
			"Release",

			"--target",
			"native",

			"--verbose",
		],
		{
			stdio: ["ignore", stdout, "inherit"],
			cwd: __build,
		},
	)

	return path.join(__top, "bin", "native.node")
}
