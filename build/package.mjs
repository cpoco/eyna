import electron_builder from "electron-builder"

export async function Package() {
	return electron_builder.build({
		config: {
			asar: false,
			files: [
				"./app/**/*",
				"./config/*.json",
				"./extension/*.js",
			],
			win: {
				target: ["7z"],
			},
			mac: {
				target: ["7z"],
				identity: null,
			},
		},
	})
}
