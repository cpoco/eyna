import * as Native from "@eyna/native/lib/renderer"

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
			status: Status.None,
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
		export type Data = {
			event: "mounted" | "resized"
			x: number
			y: number
			w: number
			h: number
		}
	}

	// renderer -> browser
	export namespace Drag {
		export const CH = "filer-drag"
		export type Data = {
			full: string
		}
	}

	// browser -> renderer
	export namespace Change {
		export const CH = "filer-change"
		export type Data = List.Data
	}

	// browser -> renderer
	export namespace Scan {
		export const CH = "filer-scan"
		export type Data = List.Data
	}

	// browser -> renderer
	export namespace Active {
		export const CH = "filer-status"
		export type Data = {
			status: Status
		}
	}

	// browser -> renderer
	export namespace Cursor {
		export const CH = "filer-cursor"
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
		export const CH = "filer-attr"
		export type Data = {
			_slice: Record<number, Native.Attributes>
		}
	}

	// browser -> renderer
	export namespace Mark {
		export const CH = "filer-mark"
		export type Data = {
			_slice: Record<number, boolean>
		}
	}

	// browser -> renderer
	export namespace Watch {
		export const CH = "filer-watch"
		export type Data = {
			watch: number
		}
	}
}
