import { type Configuration } from "app-builder-lib"
import * as electron_builder from "electron-builder"
import path from "node:path"

const __top = path.join(import.meta.dirname ?? __dirname, "..")
const __build = path.join(__top, "build")

export async function Package() {
	return electron_builder.build({
		projectDir: __top,
		config: {
			// https://www.electron.build/configuration
			artifactName: "${productName}-${version}-${os}-${arch}.${ext}",
			files: {
				from: __build,
			},
			asar: false,
			electronLanguages: "en-US",
			// https://www.electron.build/win
			win: {
				target: {
					target: "7z",
					arch: process.arch,
				},
				icon: path.join(__top, "src", "app", "asset", "icon.ico"),
			},
			// https://www.electron.build/mac
			mac: {
				target: {
					target: "7z",
					arch: process.arch,
				},
				icon: path.join(__top, "src", "app", "asset", "icon.icns"),
				identity: null,
			},
		} as Configuration,
	})
}
