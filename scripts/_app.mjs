import esbuild from "esbuild"
import fse from "fs-extra"
import module from "node:module"
import path from "node:path"
import * as perf_hooks from "node:perf_hooks"
import ts from "typescript"

const __top = path.join(import.meta.dirname, "..")
const __build = path.join(__top, "build")

const outdir = path.join(__build, "app")
const conf = path.join(__top, "tsconfig.json")
const base = __top

export async function Node() {
	const json = module.createRequire(import.meta.url)(path.join(__top, "package.json"))
	await fse.ensureDir(__build)
	return fse.writeFile(
		path.join(__build, "package.json"),
		JSON.stringify({
			name: json.name,
			version: json.version,
			main: json.main,
		}),
	)
}

export async function Conf() {
	await fse.ensureDir(__build)
	return fse.copy(path.join(__top, "config"), path.join(__build, "config"))
}

export async function Check() {
	let _time = perf_hooks.performance.now()
	return new Promise((resolve, _) => {
		const { config } = ts.readConfigFile(conf, ts.sys.readFile)
		const { options, fileNames } = ts.parseJsonConfigFileContent(config, ts.sys, base)
		const program = ts.createProgram(fileNames, options)
		const diagnostics = [
			...program.getSemanticDiagnostics(),
			...program.getSyntacticDiagnostics(),
		]
		for (const d of diagnostics) {
			console.log(
				d.file.fileName,
				d.file.getLineAndCharacterOfPosition(d.start).line + 1,
				ts.flattenDiagnosticMessageText(d.messageText, "\n"),
			)
		}
		resolve()
	})
		.then(() => {
			console.log(`app.check ${(perf_hooks.performance.now() - _time).toFixed(0)}ms`)
			return Promise.resolve()
		})
}

export async function Build() {
	let _time = perf_hooks.performance.now()
	await fse.ensureDir(outdir)
	await fse.copy(
		path.join(__top, "node_modules/monaco-editor/min/vs"),
		path.join(outdir, "vs"),
	)

	let common = {
		// define: {
		// 	"process.env.NODE_ENV": JSON.stringify("production"),
		// 	"process.env.NODE_ENV": JSON.stringify("development"),
		// },
		bundle: true,
		minify: true,
		target: ["es2020"],
		external: [
			"electron",
			"monaco-editor",
			"*.node",
		],
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
