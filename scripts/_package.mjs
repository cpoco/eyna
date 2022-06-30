import electron_builder from "electron-builder"
import path from "node:path"
import url from "node:url"

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const __top = path.join(__dirname, "..")

export async function Package(arch) {
	return electron_builder.build({
		projectDir: __top,
		config: {
			// https://www.electron.build/generated/platformspecificbuildoptions
			artifactName: "${productName}-${version}-${os}-${arch}.${ext}",
			files: [
				"./app/**/*",
				"./config/*.json",
				"./extension/*.js",
			],
			asar: false,
			// https://www.electron.build/configuration/win
			win: {
				target: {
					target: "7z",
					arch: arch,
				},
			},
			// https://www.electron.build/configuration/mac
			mac: {
				target: {
					target: "7z",
					arch: arch,
				},
				identity: null,
			},
		},
	})
}
