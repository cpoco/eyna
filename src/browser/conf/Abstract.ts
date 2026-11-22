import * as fs from "node:fs"

import { Color, log } from "@/browser/core/Log"

export abstract class Abstract<T> {
	private builtinPath: string | null = null
	private userPath: string | null = null
	private _data: T | null = null

	get data(): T {
		return this._data as T
	}

	load(builtinPath: string | null, userPath: string | null) {
		this.builtinPath = builtinPath
		this.userPath = userPath
		this.reload()
	}

	abstract postLoad(): void

	protected abstract merge(base: T, layer: unknown): void

	reload() {
		this._data = {} as T
		if (this.builtinPath) {
			this._load(this.builtinPath)
		}
		if (this.userPath) {
			this._load(this.userPath)
		}
		this.postLoad()
	}

	save() {
		if (this.userPath) {
			this._save(this.userPath)
		}
	}

	private _load(path: string) {
		try {
			log(Color.blue, "read", `"${path}"`)
			const data = JSON.parse(fs.readFileSync(path, "utf8"))
			this.merge(this._data as T, data)
		}
		catch (err) {
			console.error(err)
		}
	}

	private _save(path: string) {
		try {
			log(Color.blue, "write", `"${path}"`)
			fs.writeFileSync(path, JSON.stringify(this.data, null, "\t"), "utf8")
		}
		catch (err) {
			console.error(err)
		}
	}
}
