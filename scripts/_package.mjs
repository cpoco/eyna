import electron_builder from "electron-builder"
import path from "node:path"

const __top = path.join(import.meta.dirname, "..")
const __build = path.join(__top, "build")

export async function Package(arch) {
	return electron_builder.build({
		projectDir: __top,
		config: {
			// https://www.electron.build/generated/platformspecificbuildoptions
			artifactName: "${productName}-${version}-${os}-${arch}.${ext}",
			files: {
				from: __build,
			},
			asar: false,
			electronLanguages: "en-US",
			// https://www.electron.build/configuration/win
			win: {
				target: {
					target: "7z",
					arch: arch,
				},
				icon: path.join(__top, "src", "app", "asset", "icon.ico"),
			},
			// https://www.electron.build/configuration/mac
			mac: {
				target: {
					target: "7z",
					arch: arch,
				},
				icon: path.join(__top, "src", "app", "asset", "icon.icns"),
				identity: null,
			},
		},
	})
}
