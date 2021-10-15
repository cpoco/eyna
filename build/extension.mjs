import path from "path"
import url from "url"

import ts from "typescript"

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

export async function Build() {
	return new Promise((resolve, _) => {
		const { config } = ts.readConfigFile(path.join(__dirname, "../extension/tsconfig.json"), ts.sys.readFile)
		const { options, fileNames } = ts.parseJsonConfigFileContent(config, ts.sys, path.join(__dirname, "../extension"))
		const program = ts.createProgram(fileNames, options)
		const diagnostics = [
			...program.getSemanticDiagnostics(),
			...program.getSyntacticDiagnostics()
		]
		diagnostics.forEach((d) => {
			console.log(d.file.fileName, d.file.getLineAndCharacterOfPosition(d.start).line + 1, ts.flattenDiagnosticMessageText(d.messageText, "\n"))
		})
		program.emit()
		resolve()
	})
}