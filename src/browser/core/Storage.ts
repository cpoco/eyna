import * as electron from "electron"
import * as fs from "node:fs"

export namespace Storage {
	type ConfData = {
		window?: electron.Rectangle
		wd?: string[]
	}

	class Manager {
		private path: string = ""
		data: ConfData = {}

		load(path: string) {
			this.path = path
			this.reload()
		}

		reload() {
			this.data = {}
			try {
				this.data = JSON.parse(fs.readFileSync(this.path, "utf8"))
			}
			catch (err) {
				console.error(err)
			}
		}

		save() {
			if (this.path == null) {
				return
			}
			try {
				fs.writeFileSync(this.path, JSON.stringify(this.data))
			}
			catch (err) {
			}
		}
	}

	export const manager = new Manager()
}
