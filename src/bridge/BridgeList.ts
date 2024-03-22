import * as Native from "@eyna/native/ts/renderer"

import { Status } from "@/bridge/Status"

export namespace List {
	export type Data = {
		create: number
		elapse: number
		status: Status
		search: boolean
		cursor: number
		length: number
		wd: string
		st: Native.Attributes
		ls: Native.Attributes[]
		mk: boolean[]
		drawCount: number
		drawIndex: number
		drawPosition: number
		drawSize: number
		knobPosition: number
		knobSize: number
		watch: number
		error: number
	}
	export function InitData(): Data {
		return {
			create: 0,
			elapse: 0,
			status: Status.none,
			search: false,
			cursor: 0,
			length: 0,
			wd: "",
			st: [],
			ls: [],
			mk: [],
			drawCount: 0,
			drawIndex: 0,
			drawPosition: 0,
			drawSize: 0,
			knobPosition: 0,
			knobSize: 0,
			watch: 0,
			error: 0,
		}
	}

	// renderer -> browser
	export namespace Dom {
		export const CH = "filer-dom"
		export type Send = {
			ch: typeof CH
			args: [
				number,
				Data,
			]
		}
		export type Data = {
			event: "mounted" | "resized"
			data: {
				x: number
				y: number
				w: number
				h: number
			}
		}
	}

	// renderer -> browser
	export namespace Drag {
		export const CH = "filer-drag"
		export type Send = {
			ch: typeof CH
			args: [
				number,
				Data,
			]
		}
		export type Data = {
			data: {
				full: string
			}
		}
	}

	// browser -> renderer
	export namespace Change {
		export const CH = "filer-change"
		export type Send = {
			ch: typeof CH
			args: [
				number,
				Data,
			]
		}
		export type Data = List.Data
	}

	// browser -> renderer
	export namespace Scan {
		export const CH = "filer-scan"
		export type Send = {
			ch: typeof CH
			args: [
				number,
				Data,
			]
		}
		export type Data = List.Data
	}

	// browser -> renderer
	export namespace Active {
		export const CH = "filer-status"
		export type Send = {
			ch: typeof CH
			args: [
				number,
				Data,
			]
		}
		export type Data = {
			status: Status
		}
	}

	// browser -> renderer
	export namespace Cursor {
		export const CH = "filer-cursor"
		export type Send = {
			ch: typeof CH
			args: [
				number,
				Data,
			]
		}
		export type Data = {
			cursor: number
			drawCount: number
			drawIndex: number
			drawPosition: number
			drawSize: number
			knobPosition: number
			knobSize: number
		}
	}

	// browser -> renderer
	export namespace Attribute {
		export const CH = "filer-attribute"
		export type Send = {
			ch: typeof CH
			args: [
				number,
				Data,
			]
		}
		export type Data = {
			_slice: Slice
		}
		export type Slice = {
			[index: number]: Native.Attributes
		}
	}

	// browser -> renderer
	export namespace Mark {
		export const CH = "filer-mark"
		export type Send = {
			ch: typeof CH
			args: [
				number,
				Data,
			]
		}
		export type Data = {
			_slice: Slice
		}
		export type Slice = {
			[index: number]: boolean
		}
	}

	// browser -> renderer
	export namespace Watch {
		export const CH = "filer-watch"
		export type Send = {
			ch: typeof CH
			args: [
				number,
				Data,
			]
		}
		export type Data = {
			watch: number
		}
	}
}
