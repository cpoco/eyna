export namespace System {
	// renderer -> browser
	export namespace Active {
		export const CH = "system-active"
		export type Send = {
			ch: typeof CH
			args: Args
		}
		export type Args = [
			number,
			Data,
		]
		export type Data = boolean
	}

	// renderer -> browser
	export namespace Dom {
		export const CH = "system-dom"
		export type Send = {
			ch: typeof CH
			args: Args
		}
		export type Args = [
			-1,
			Data,
		]
		export type Data = {
			event: "mounted"
			root: {
				x: number
				y: number
				w: number
				h: number
			}
		}
	}

	// browser -> renderer
	export namespace Style {
		export type Data = {
			active: boolean
			fontSize: number
			lineHeight: number
		}
	}
}
