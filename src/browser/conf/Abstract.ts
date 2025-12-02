import * as fs from "node:fs"

export abstract class Abstract<T> {
	public path: string = ""
	public data: T

	constructor(data: T) {
		this.data = data
	}

	load(path: string) {
		this.path = path
		this.reload()
		this.postLoad()
	}

	abstract postLoad(): void

	reload() {
		try {
			console.log(`\u001b[34m[read]\u001b[0m`, `"${this.path}"`)
			this.data = JSON.parse(fs.readFileSync(this.path, "utf8"))
		}
		catch (err) {
			console.error(err)
		}
	}

	save() {
		try {
			console.log(`\u001b[34m[write]\u001b[0m`, `"${this.path}"`)
			fs.writeFileSync(this.path, JSON.stringify(this.data, null, "\t"), "utf8")
		}
		catch (err) {
			console.error(err)
		}
	}
}
