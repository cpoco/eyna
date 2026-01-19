import esbuild from "esbuild"
import * as path from "node:path"
import * as perf_hooks from "node:perf_hooks"
import ts from "typescript"

const __top = path.join(import.meta.dirname ?? __dirname, "..")
const __build = path.join(__top, "build")

const outdir = path.join(__build, "extension")
const conf = path.join(__top, "extension/tsconfig.json")
const base = path.join(__top, "extension")

export async function Check() {
	let _time = perf_hooks.performance.now()
	return new Promise<void>((resolve, _) => {
		const { config } = ts.readConfigFile(conf, ts.sys.readFile)
		const { options, fileNames } = ts.parseJsonConfigFileContent(config, ts.sys, base)
		const program = ts.createProgram(fileNames, options)
		const diagnostics = [
			...program.getSemanticDiagnostics(),
			...program.getSyntacticDiagnostics(),
		]
		for (const d of diagnostics) {
			if (!d.file || !d.start) {
				continue
			}
			console.log(
				d.file.fileName,
				d.file.getLineAndCharacterOfPosition(d.start).line + 1,
				ts.flattenDiagnosticMessageText(d.messageText, "\n"),
			)
		}
		resolve()
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
