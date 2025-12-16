import { Abstract } from "@/browser/conf/Abstract"
import * as Util from "@eyna/util"

type FileFormat = {
	styleFontFamily: string
	styleFontSize: number
	styleLineHeight: number
}

class Sys extends Abstract<FileFormat> {
	postLoad() {
		if (!Util.isString(this.data.styleFontFamily) || this.data.styleFontFamily.length == 0) {
			throw new Error("styleFontFamily must be non-empty string")
		}
		if (!Util.isNumber(this.data.styleFontSize) || this.data.styleFontSize <= 0) {
			throw new Error("styleFontSize must be positive")
		}
		if (!Util.isNumber(this.data.styleLineHeight) || this.data.styleLineHeight <= 0) {
			throw new Error("styleLineHeight must be positive")
		}
	}
}

export const SysConfig = new Sys()
