export namespace Viewer {
	// browser -> renderer
	export namespace Open {
		export const CH = "viewer-open"
		export type Send = {
			ch: "viewer-open"
			args: Args
		}
		export type Args = [
			number,
			Data,
		]
		export type Data = DataText
		export type DataText = {
			type: "text"
			path: string
			size: number
		}
	}

	// browser -> renderer
	export namespace Close {
		export const CH = "viewer-close"
		export type Send = {
			ch: "viewer-close"
			args: Args
		}
		export type Args = [
			number,
			Data,
		]
		export type Data = {}
	}
}
