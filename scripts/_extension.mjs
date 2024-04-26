import esbuild from "esbuild"
import fse from "fs-extra"
import path from "node:path"
import * as perf_hooks from "node:perf_hooks"
import url from "node:url"
import ts from "typescript"

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const __top = path.join(__dirname, "..")
const __build = path.join(__top, "build")

const outdir = path.join(__build, "extension")
const conf = path.join(__top, "extension/tsconfig.json")
const base = path.join(__top, "extension")

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
		diagnostics.forEach((d) => {
			console.log(
				d.file.fileName,
				d.file.getLineAndCharacterOfPosition(d.start).line + 1,
				ts.flattenDiagnosticMessageText(d.messageText, "\n"),
			)
		})
		resolve()
	})
		.then(() => {
			console.log(`ext.check ${(perf_hooks.performance.now() - _time).toFixed(0)}ms`)
			return Promise.resolve()
		})
}

export async function Build() {
	let _time = perf_hooks.performance.now()
	await fse.ensureDir(outdir)
	return esbuild.build({
		entryPoints: [
			path.join(base, "src/fs.copy.ts"),
			path.join(base, "src/fs.duplicate.ts"),
			path.join(base, "src/fs.mkdir.ts"),
			path.join(base, "src/fs.mkfile.ts"),
			path.join(base, "src/fs.move.ts"),
			path.join(base, "src/fs.rename.ts"),
			path.join(base, "src/fs.trash.ts"),
			path.join(base, "src/list.code.ts"),
			path.join(base, "src/list.terminal.ts"),
		],
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
