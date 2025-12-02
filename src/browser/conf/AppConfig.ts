import * as electron from "electron"

import * as Conf from "@/app/Conf"
import { Abstract } from "@/browser/conf/Abstract"

type FileFormat = {
	window?: electron.Rectangle
	wd?: string[]

	cssFontFamily?: string
	cssFontSize?: number
	cssLineHeight?: number
}

class App extends Abstract<FileFormat> {
	constructor() {
		super({})
	}

	postLoad() {
		if (!this.data.cssFontFamily) {
			this.data.cssFontFamily = Conf.FONT_FAMILY
		}
		if (!this.data.cssFontSize) {
			this.data.cssFontSize = Conf.FONT_SIZE
		}
		if (!this.data.cssLineHeight) {
			this.data.cssLineHeight = Conf.LINE_HEIGHT
		}
	}
}

export const AppConfig = new App()
