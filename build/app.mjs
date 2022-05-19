import esbuild from "esbuild"
import fse from "fs-extra"
import path from "node:path"
import url from "node:url"
import ts from "typescript"

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const outdir = path.join(__dirname, "../app")
const conf = path.join(__dirname, "../tsconfig.json")
const base = path.join(__dirname, "..")

export async function Init() {
	return fse.ensureDir(outdir)
}

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
	fse.copySync(
		path.join(__dirname, "../node_modules/monaco-editor/min/vs"),
		path.join(__dirname, "../app/vs"),
	)
	return esbuild.build({
		define: {
			"process.env.NODE_ENV": JSON.stringify("production"),
			// "process.env.NODE_ENV": JSON.stringify("development"),
		},
		entryPoints: {
			preload: path.join(__dirname, "../src/browser/Preload.ts"),
			browser: path.join(__dirname, "../src/browser/Main.ts"),
			renderer: path.join(__dirname, "../src/renderer/Main.ts"),
		},
		bundle: true,
		minify: true,
		platform: "node",
		external: [
			"electron",
			"monaco-editor",
			"*.node",
		],
		outdir: outdir,
		legalComments: "external",
	})
}
