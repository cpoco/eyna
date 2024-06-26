export namespace System {
	// renderer -> browser
	export namespace Active {
		export const CH = "system-active"
		export type Send = {
			ch: typeof CH
			id: -1
			data: Data
		}
		export type Data = boolean
	}

	// renderer -> browser
	export namespace Version {
		export const CH = "system-version"
		export type Send = {
			ch: typeof CH
			id: -1
			data: Data
		}
		export type Data = boolean
	}

	// renderer -> browser -> renderer
	export namespace Dom {
		export const CH = "system-dom"
		export type Send = {
			ch: typeof CH
			id: -1
			data: Data
		}
		export type Data = {
			event: "mounted"
			root: {
				x: number
				y: number
				w: number
				h: number
			}
		}
		export type Result = {
			app: {
				ready: boolean
				active: boolean
			}
			overlay: {
				version: boolean
			}
			style: {
				fontSize: number
				lineHeight: number
			}
		}
	}
}
