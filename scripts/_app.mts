import child_process from "node:child_process"
import fs from "node:fs/promises"
import module from "node:module"
import path from "node:path"
import * as perf_hooks from "node:perf_hooks"

import esbuild from "esbuild"

import package_json from "../package.json" with { type: "json" }

const __top = path.join(import.meta.dirname, "..")
const __build = path.join(__top, "build")

const outdir = path.join(__build, "app")
const conf = path.join(__top, "tsconfig.json")
const base = __top

export async function Node() {
	return fs.writeFile(
		path.join(__build, "package.json"),
		JSON.stringify({
			name: package_json.name,
			version: package_json.version,
			main: package_json.main,
		}),
	)
}

export async function Conf() {
	return fs.cp(path.join(__top, "config"), path.join(__build, "config"), { recursive: true })
}

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
			console.log(`app.check ${(perf_hooks.performance.now() - _time).toFixed(0)}ms`)
			return Promise.resolve()
		})
}

export async function Build() {
	let _time = perf_hooks.performance.now()
	await fs.cp(
		path.join(__top, "node_modules/monaco-editor/min/vs"),
		path.join(outdir, "vs"),
		{ recursive: true },
	)
	await fs.cp(
		path.join(__top, "node_modules/monaco-editor/esm/vs/base/browser/ui/codicons/codicon/codicon.ttf"),
		path.join(outdir, "vs/base/browser/ui/codicons/codicon/codicon.ttf"),
		{ recursive: true },
	)

	let common: esbuild.BuildOptions = {
		// define: {
		// 	"process.env.NODE_ENV": JSON.stringify("production"),
		// 	"process.env.NODE_ENV": JSON.stringify("development"),
		// },
		packages: "bundle",
		bundle: true,
		minify: true,
		target: ["es2020"],
		external: [
			"electron",
			"monaco-editor",
			"*.node",
		],
		loader: {
			".png": "base64",
		},
		outdir: outdir,
	}

	let browser = esbuild.build(Object.assign(common, {
		entryPoints: {
			preload: path.join(__top, "src/browser/Preload.ts"),
			browser: path.join(__top, "src/browser/Main.ts"),
		},
		format: "cjs",
		platform: "node",
		outExtension: {
			".js": ".cjs",
		},
	}))

	let renderer = esbuild.build(Object.assign(common, {
		define: {
			"__VUE_OPTIONS_API__": JSON.stringify(false),
			"__VUE_PROD_DEVTOOLS__": JSON.stringify(false),
			"__VUE_PROD_HYDRATION_MISMATCH_DETAILS__": JSON.stringify(false),
		},
		entryPoints: {
			renderer: path.join(__top, "src/renderer/Main.ts"),
		},
		format: "esm",
		platform: "browser",
		outExtension: {
			".js": ".mjs",
		},
	}))

	return Promise.all([browser, renderer])
		.then(() => {
			console.log(`app.build ${(perf_hooks.performance.now() - _time).toFixed(0)}ms`)
			return Promise.resolve()
		})
}
