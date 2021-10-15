export namespace Filer {
	// renderer -> browser
	export namespace Resize {
		export const CH = 'filer-resize'
		export type Send = {
			ch: 'filer-resize'
			args: Args
		}
		export type Args = [
			-1,
			Data,
		]
		export type Data = {
			event: "mounted" | "resized"
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
			fontSize: string
			lineHeight: string
		}
	}
}