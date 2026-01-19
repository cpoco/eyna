import child_process, { type IOType } from "node:child_process"
import fs from "node:fs"
import path from "node:path"

const __top = path.join(import.meta.dirname, "..")
const __build = path.join(__top, "build")

export { setVsCmdEnv } from "./_vcvarsall.mts"

export async function configure(name: "node" | "electron", version: string, stdout: IOType = "ignore"): Promise<void> {
	fs.rmSync(__build, { recursive: true, force: true })
	fs.mkdirSync(__build, { recursive: true })

	return new Promise<void>((resolve, reject) => {
		child_process.spawn(
			"cmake",
			[
				"--fresh",

				`-DVCPKG_TRIPLET=${process.platform}-${process.arch}`,
				`-DNODE_RUNTIME_NAME=${name}`,
				`-DNODE_RUNTIME_VERSION=${version}`,

				"-G",
				"Ninja Multi-Config",

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
