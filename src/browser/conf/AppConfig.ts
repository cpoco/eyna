import * as electron from "electron"

import { Abstract } from "@/browser/conf/Abstract"

type FileFormat = {
	window?: electron.Rectangle
	wd?: string[]
}

class App extends Abstract<FileFormat> {
	postLoad() {
	}
}

export const AppConfig = new App()
