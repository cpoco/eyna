import { Status } from "@bridge/Status"
import * as Native from "@module/native/ts/renderer"

export namespace List {
	export type Data = {
		status: Status
		update: number
		cursor: number
		length: number
		wd: string
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
			status: Status.none,
			update: 0,
			cursor: 0,
			length: 0,
			wd: "",
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
			args: Args
		}
		export type Args = [
			number,
			Data,
		]
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

	// browser -> renderer
	export namespace Change {
		export const CH = "filer-change"
		export type Send = {
			ch: typeof CH
			args: Args
		}
		export type Args = [
			number,
			Data,
		]
		export type Data = List.Data
	}

	// browser -> renderer
	export namespace Scan {
		export const CH = "filer-scan"
		export type Send = {
			ch: typeof CH
			args: Args
		}
		export type Args = [
			number,
			Data,
		]
		export type Data = List.Data
	}

	// browser -> renderer
	export namespace Active {
		export const CH = "filer-status"
		export type Send = {
			ch: typeof CH
			args: Args
		}
		export type Args = [
			number,
			Data,
		]
		export type Data = {
			status: Status
		}
	}

	// browser -> renderer
	export namespace Cursor {
		export const CH = "filer-cursor"
		export type Send = {
			ch: typeof CH
			args: Args
		}
		export type Args = [
			number,
			Data,
		]
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
			args: Args
		}
		export type Args = [
			number,
			Data,
		]
		export type Data = {
			update: number
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
			args: Args
		}
		export type Args = [
			number,
			Data,
		]
		export type Data = {
			update: number
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
			args: Args
		}
		export type Args = [
			number,
			Data,
		]
		export type Data = {
			update: number
			watch: number
		}
	}
}
