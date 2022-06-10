import electron_builder from "electron-builder"

export async function Package(arch) {
	return electron_builder.build({
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
