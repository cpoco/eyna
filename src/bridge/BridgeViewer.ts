export namespace Viewer {
	export enum Type {
		Text = "text",
		Diff = "diff",
		Hex = "hex",
		Image = "image",
		Audio = "audio",
		Video = "video",
		Embed = "embed",
	}

	// renderer -> browser
	export namespace Event {
		export const CH = "viewer-event"
		export type Data = "opened" | "closed"
	}

	// browser -> renderer
	export namespace Open {
		export const CH = "viewer-open"
		export type Data = DataText | DataHex | DataDiff | DataImage | DataAudio | DataVideo | DataEmbed
		export type DataText = {
			type: Type.Text
			mime: []
			href: [string]
			path: [string]
			size: [bigint]
		}
		export type DataDiff = {
			type: Type.Diff
			mime: []
			href: [string, string]
			path: [string, string]
			size: [bigint, bigint]
		}
		export type DataHex = {
			type: Type.Hex
			mime: []
			href: [string]
			path: [string]
			size: [bigint]
		}
		export type DataImage = {
			type: Type.Image
			mime: []
			href: [string]
			path: [string]
			size: [bigint]
		}
		export type DataAudio = {
			type: Type.Audio
			mime: []
			href: [string]
			path: [string]
			size: [bigint]
		}
		export type DataVideo = {
			type: Type.Video
			mime: []
			href: [string]
			path: [string]
			size: [bigint]
		}
		export type DataEmbed = {
			type: Type.Embed
			mime: [string]
			href: [string]
			path: [string]
			size: [bigint]
		}
	}

	// browser -> renderer
	export namespace Close {
		export const CH = "viewer-close"
		export type Data = null
	}

	// browser -> renderer
	export namespace Diff {
		export const CH = "viewer-diff"
		export type Data = "prev" | "next"
	}

	// browser -> renderer
	export namespace Audio {
		export const CH = "viewer-audio"
		export type Data = "toggle" | "ff" | "rw"
	}

	// browser -> renderer
	export namespace Video {
		export const CH = "viewer-video"
		export type Data = "toggle" | "ff" | "rw"
	}
}
