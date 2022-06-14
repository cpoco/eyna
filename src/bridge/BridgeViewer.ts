export namespace Viewer {
	// renderer -> browser
	export namespace Event {
		export const CH = "viewer-event"
		export type Send = {
			ch: typeof CH
			args: Args
		}
		export type Args = [
			number,
			Data,
		]
		export type Data = opened | closed
		type opened = {
			event: "opened"
		}
		type closed = {
			event: "closed"
		}
	}

	// browser -> renderer
	export namespace Open {
		export const CH = "viewer-open"
		export type Send = {
			ch: typeof CH
			args: Args
		}
		export type Args = [
			number,
			Data,
		]
		export type Data = DataText | DataImage
		export type DataText = {
			type: "text"
			path: string
			size: bigint
		}
		export type DataImage = {
			type: "image"
			path: string
			size: bigint
		}
	}

	// browser -> renderer
	export namespace Close {
		export const CH = "viewer-close"
		export type Send = {
			ch: typeof CH
			args: Args
		}
		export type Args = [
			number,
			Data,
		]
		export type Data = {}
	}
}
