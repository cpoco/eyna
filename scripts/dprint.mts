import { createContext } from "@dprint/formatter"
import * as typescript from "@dprint/typescript"
import fs from "node:fs/promises"
import path from "node:path"

const __top = path.join(import.meta.dirname, "..")

const context = createContext({
	useTabs: true,
})
context.addPlugin(await fs.readFile(typescript.getPath()), {
	semiColons: "asi",
	useBraces: "always",
	nextControlFlowPosition: "nextLine",
})

async function fmt(pattern: string): Promise<void> {
	for await (const file of fs.glob(pattern)) {
		const rel = path.relative(__top, file)
		try {
			const code = await fs.readFile(file, "utf-8")
			const out = context.formatText({
				filePath: rel,
				fileText: code,
			})
			if (code !== out) {
				console.log(`fmt  ${rel}`)
				await fs.writeFile(file, out)
			}
			else {
				console.log(`skip ${rel}`)
			}
		}
		catch (error: unknown) {
			console.error(`err  ${rel}`, error)
		}
	}
}

try {
	await fmt(path.join(__top, "{extension,pkg,scripts,src}", "**", "*.{ts,cts,mts}"))
}
catch (err: unknown) {
	console.error(err)
	process.exit(1)
}
