import esbuild from "esbuild"
import path from "node:path"
import url from "node:url"
import ts from "typescript"

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const outdir = path.join(__dirname, "../extension")
const conf = path.join(__dirname, "../extension/tsconfig.json")
const base = path.join(__dirname, "../extension")

export async function Check() {
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
}

export async function Build() {
	return esbuild.build({
		entryPoints: [
			path.join(base, "src/fs.copy.ts"),
			path.join(base, "src/fs.duplicate.ts"),
			path.join(base, "src/fs.mkdir.ts"),
			path.join(base, "src/fs.move.ts"),
			path.join(base, "src/fs.rename.ts"),
			path.join(base, "src/fs.trash.ts"),
			path.join(base, "src/list.code.ts"),
			path.join(base, "src/list.terminal.ts"),
			path.join(base, "src/list.test.ts"),
		],
		bundle: false,
		minify: false,
		format: "cjs",
		platform: "node",
		outdir: outdir,
	})
}
