export namespace System {
	// renderer -> browser
	export namespace Active {
		export const CH = "system-active"
		export type Data = boolean
	}

	// renderer -> browser
	export namespace Version {
		export const CH = "system-version"
		export type Data = boolean
	}

	// renderer -> browser -> renderer
	export namespace Dom {
		export const CH = "system-dom"
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
				fontFamily: string
				fontSize: number
				lineHeight: number
			}
		}
	}
}
