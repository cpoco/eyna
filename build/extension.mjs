import path from "node:path"
import url from "node:url"
import ts from "typescript"

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const conf = path.join(__dirname, "../extension/tsconfig.json")
const base = path.join(__dirname, "../extension")

export async function Build() {
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
		program.emit()
		resolve()
	})
}
