import * as electron from "electron"

import { Abstract } from "@/browser/conf/Abstract"
import * as Util from "@eyna/util"

type FileFormat = {
	window?: electron.Rectangle
	wd?: string[]
}

class App extends Abstract<FileFormat> {
	postLoad() {
	}

	protected merge(base: FileFormat, layer: unknown) {
		Util.merge(base, layer)
	}
}

export const AppConfig = new App()
