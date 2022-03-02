import esbuild from "esbuild"
import fs from "fs/promises"
import path from "path"
import ts from "typescript"
import url from "url"

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const outdir = path.join(__dirname, "../app")
const conf = path.join(__dirname, "../tsconfig.json")
const base = path.join(__dirname, "..")

export async function Init() {
	return fs.mkdir(outdir)
		.then(() => {
			return Promise.resolve()
		})
		.catch((err) => {
			if (err.code === "EEXIST") {
				return Promise.resolve()
			}
			return Promise.reject(err)
		})
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
	return esbuild.build({
		define: {
			"process.env.NODE_ENV": "\"production\"",
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
			"*.node",
		],
		outdir: outdir,
		legalComments: "external",
	})
}
