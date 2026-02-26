import { Abstract } from "@/browser/conf/Abstract"
import * as Util from "@eyna/util"
import { Path } from "../core/Path"

type FileFormat = {
	styleFontFamily: string
	styleFontSize: number
	styleLineHeight: number
	favorites: { name: string; path: string }[]
}

class Sys extends Abstract<FileFormat> {
	postLoad() {
		if (!Util.isString(this.data.styleFontFamily) || this.data.styleFontFamily.length === 0) {
			throw new Error("styleFontFamily must be non-empty string")
		}
		if (!Util.isNumber(this.data.styleFontSize) || this.data.styleFontSize <= 0) {
			throw new Error("styleFontSize must be positive")
		}
		if (!Util.isNumber(this.data.styleLineHeight) || this.data.styleLineHeight <= 0) {
			throw new Error("styleLineHeight must be positive")
		}
		if (!Util.isArray(this.data.favorites)) {
			throw new Error("favorites must be an array")
		}
		for (const f of this.data.favorites) {
			if (!Util.isString(f.name) || f.name.length === 0) {
				throw new Error("favorites.name must be non-empty string")
			}
			if (!Util.isString(f.path) || f.path.length === 0) {
				throw new Error("favorites.path must be non-empty string")
			}

			if (f.path === "~") {
				f.path = Path.home()
			}
			else if (f.path.startsWith("~/")) {
				f.path = Path.home(f.path.slice(2))
			}
		}
	}
}

export const SysConfig = new Sys()
