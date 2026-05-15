import esbuild from "esbuild"
import child_process from "node:child_process"
import module from "node:module"
import * as path from "node:path"
import * as perf_hooks from "node:perf_hooks"

const __top = path.join(import.meta.dirname, "..")
const __build = path.join(__top, "build")

const outdir = path.join(__build, "extension")
const conf = path.join(__top, "extension/tsconfig.json")
const base = path.join(__top, "extension")

export async function Check() {
	let _time = perf_hooks.performance.now()
	const require = module.createRequire(import.meta.url)
	const tsc = require.resolve("typescript/bin/tsc")

	return new Promise<void>((resolve, reject) => {
		child_process.spawn(
			process.execPath,
			[
				tsc,
				"--project",
				conf,
			],
			{
				stdio: ["ignore", "inherit", "inherit"],
				cwd: base,
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
			console.log(`ext.check ${(perf_hooks.performance.now() - _time).toFixed(0)}ms`)
			return Promise.resolve()
		})
}

export async function Build() {
	let _time = perf_hooks.performance.now()
	return esbuild.build({
		entryPoints: [
			path.join(base, "src/fs.copy.cts"),
			path.join(base, "src/fs.duplicate.cts"),
			path.join(base, "src/fs.mkdir.cts"),
			path.join(base, "src/fs.mkfile.cts"),
			path.join(base, "src/fs.mkslink.cts"),
			path.join(base, "src/fs.move.cts"),
			path.join(base, "src/fs.rename.cts"),
			path.join(base, "src/fs.trash.cts"),
			path.join(base, "src/list.code.cts"),
			path.join(base, "src/list.fork.cts"),
			path.join(base, "src/list.terminal.cts"),
		],
		packages: "bundle",
		bundle: true,
		minify: false,
		format: "cjs",
		platform: "node",
		target: ["es2020"],
		outdir: outdir,
		outExtension: {
			".js": ".cjs",
		},
	})
		.then(() => {
			console.log(`ext.build ${(perf_hooks.performance.now() - _time).toFixed(0)}ms`)
			return Promise.resolve()
		})
}
