import * as fs from "node:fs"

import * as Util from "@eyna/util"

import { Color, log } from "@/browser/core/Log"

export abstract class Abstract<T> {
	private path1: string | null = null
	private path2: string | null = null
	private _data: T | null = null

	get data(): T {
		return this._data as T
	}

	load(path1: string | null, path2: string | null) {
		this.path1 = path1
		this.path2 = path2
		this.reload()
	}

	abstract postLoad(): void

	reload() {
		this._data = {} as T
		if (this.path1) {
			this._load(this.path1)
		}
		if (this.path2) {
			this._load(this.path2)
		}
		this.postLoad()
	}

	save() {
		if (this.path2) {
			this._save(this.path2)
		}
	}

	private _load(path: string) {
		try {
			log(Color.blue, "read", `"${path}"`)
			const data = JSON.parse(fs.readFileSync(path, "utf8"))
			Util.merge(this._data, data)
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
