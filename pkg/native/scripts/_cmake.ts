import child_process, { type IOType, SpawnOptions } from "node:child_process"
import fs from "node:fs"
import path from "node:path"

const __top = path.join(import.meta.dirname ?? __dirname, "..")
const __build = path.join(__top, "build")

export async function configure(name: "node" | "electron", version: string, stdout: IOType = "ignore"): Promise<void> {
	fs.rmSync(__build, { recursive: true, force: true })
	fs.mkdirSync(__build, { recursive: true })

	const separator = process.platform === "win32" ? ";" : ":"
	console.log("   PATH", (process.env.PATH ?? "").trim().split(separator))
	console.log("INCLUDE", (process.env.INCLUDE ?? "").trim().split(separator))
	console.log("    LIB", (process.env.LIB ?? "").trim().split(separator))
	console.log("LIBPATH", (process.env.LIBPATH ?? "").trim().split(separator))

	return new Promise<void>((resolve, reject) => {
		child_process.spawn(
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

export async function build(stdout: IOType = "ignore"): Promise<string> {
	return new Promise<void>((resolve, reject) => {
		child_process.spawn(
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
		.then(() => {
			return path.join(__top, "bin", "native.node")
		})
}
