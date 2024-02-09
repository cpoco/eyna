export namespace Viewer {
	// renderer -> browser
	export namespace Event {
		export const CH = "viewer-event"
		export type Send = {
			ch: typeof CH
			args: [
				number,
				Data,
			]
		}
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
			args: [
				number,
				Data,
			]
		}
		export type Data = DataText | DataDiff | DataImage | DataAudio | DataVideo
		export type DataText = {
			type: "text"
			path: [string]
			size: [bigint]
		}
		export type DataDiff = {
			type: "diff"
			path: [string, string]
			size: [bigint, bigint]
		}
		export type DataImage = {
			type: "image"
			path: [string]
			size: [bigint]
		}
		export type DataAudio = {
			type: "audio"
			path: [string]
			size: [bigint]
		}
		export type DataVideo = {
			type: "video"
			path: [string]
			size: [bigint]
		}
	}

	// browser -> renderer
	export namespace Close {
		export const CH = "viewer-close"
		export type Send = {
			ch: typeof CH
			args: [
				number,
				Data,
			]
		}
		export type Data = {}
	}

	// browser -> renderer
	export namespace Diff {
		export const CH = "viewer-diff"
		export type Send = {
			ch: typeof CH
			args: [
				number,
				Data,
			]
		}
		export type Data = "prev" | "next"
	}
}
