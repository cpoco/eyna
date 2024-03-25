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
				console.log(`\u001b[34m[conf.read]\u001b[0m`, `"${this.path}"`)
				this.data = JSON.parse(fs.readFileSync(this.path, "utf8"))
			}
			catch (err) {
				console.error(err)
			}
		}

		save() {
			try {
				console.log(`\u001b[34m[conf.write]\u001b[0m`, `"${this.path}"`)
				fs.writeFileSync(this.path, JSON.stringify(this.data))
			}
			catch (err) {
				console.error(err)
			}
		}
	}

	export const manager = new Manager()
}
