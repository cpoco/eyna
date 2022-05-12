import electron_builder from "electron-builder"

export async function Package() {
	return electron_builder.build({
		config: {
			// https://www.electron.build/generated/platformspecificbuildoptions
			asar: false,
			files: [
				"./app/**/*",
				"./config/*.json",
				"./extension/*.js",
			],
			// https://www.electron.build/configuration/win
			win: {
				target: ["7z"],
			},
			// https://www.electron.build/configuration/mac
			mac: {
				target: ["7z"],
				identity: null,
			},
		},
	})
}
