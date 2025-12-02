import { Abstract } from "@/browser/conf/Abstract"
import * as electron from "electron"

type FileFormat = {
	window?: electron.Rectangle
	wd?: string[]
}

class App extends Abstract<FileFormat> {
	constructor() {
		super({})
	}

	postLoad() {
		if (this.data.window) {
			const workareas = electron.screen.getAllDisplays().map((d) => d.workArea)
			const inside = workareas.some(
				(wa) => {
					if (!this.data.window) {
						return false
					}
					const x = wa.x <= this.data.window.x && this.data.window.x + this.data.window.width <= wa.x + wa.width
					const y = wa.y <= this.data.window.y && this.data.window.y + this.data.window.height <= wa.y + wa.height
					return x && y
				},
			)
			if (!inside) {
				delete this.data.window
			}
		}
	}
}

export const AppConfig = new App()
