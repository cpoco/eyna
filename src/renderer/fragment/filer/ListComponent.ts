import * as Native from "@eyna/native/lib/renderer"
import * as vue from "@vue/runtime-dom"

import * as Bridge from "@/bridge/Bridge"
import { Status } from "@/bridge/Status"
import * as Font from "@/renderer/dom/Font"
import * as Unicode from "@/renderer/dom/Unicode"
import * as CellComponent from "@/renderer/fragment/filer/CellComponent"
import root from "@/renderer/Root"

const TAG = "list"

const TAG_PATH = "path"
const TAG_INFO = "info"
const TAG_STAT = "stat"
const TAG_DATA = "data"
const TAG_SCROLL = "scroll"

export type List = {
	wd: string
	st: Native.Attributes
	search: boolean
	info: {
		show: boolean
		sync: boolean
		mark: number
		total: number
		error: number
		elapse: number
	}
	stat: {
		status: Status
		active: boolean
		target: boolean
	}
	knob: {
		pos: number
		size: number
	}
}
export function InitList(): List {
	return {
		wd: "",
		st: [],
		search: false,
		info: {
			show: false,
			sync: false,
			mark: 0,
			total: 0,
			error: 0,
			elapse: 0,
		},
		stat: {
			status: Status.None,
			active: false,
			target: false,
		},
		knob: {
			pos: 0,
			size: 0,
		},
	}
}

const DATA = "data"

export const V = vue.defineComponent({
	props: {
		i: {
			required: true,
			type: Number,
		},
		list: {
			required: true,
			type: Object as vue.PropType<List>,
		},
		ctop: {
			required: true,
			type: Number,
		},
		cell: {
			required: true,
			type: Object as vue.PropType<CellComponent.Cell[]>,
		},
	},

	setup(props) {
		const el = vue.useTemplateRef<HTMLElement>(DATA)

		const _mounted = () => {
			let d: DOMRect = el.value!.getBoundingClientRect()
			root.send(
				Bridge.List.Dom.CH,
				props.i,
				{
					event: "mounted",
					x: d.x,
					y: d.y,
					w: d.width,
					h: d.height,
				},
			)
		}

		const _resized = () => {
			let d: DOMRect = el.value!.getBoundingClientRect()
			root.send(
				Bridge.List.Dom.CH,
				props.i,
				{
					event: "resized",
					x: d.x,
					y: d.y,
					w: d.width,
					h: d.height,
				},
			)
		}

		vue.onMounted(() => {
			_mounted()
		})

		vue.onBeforeUnmount(() => {
			window.removeEventListener("resize", _resized)
		})

		window.addEventListener("resize", _resized)

		return {}
	},

	render() {
		const err = this.list.st[0]?.file_type == Native.AttributeFileType.None

		return vue.h(TAG, { class: { "filer-list": true } }, [
			vue.h(
				TAG_PATH,
				{ class: { "filer-path": true } },
				Unicode.highlight(this.list.wd, err),
			),
			vue.h(
				TAG_INFO,
				{ class: { "filer-info": true } },
				this.list.info.show
					? [
						vue.h(
							"span",
							{ class: { "filer-info-icon": true } },
							this.list.info.sync
								? Font.Icon.Sync
								: Font.Icon.SyncIgnored,
						),
						vue.h("span", { class: { "filer-info-text": true } }, `${this.list.info.mark}/${this.list.info.total}`),
						vue.h("span", { class: { "filer-info-icon": true } }, Font.Icon.History),
						vue.h("span", { class: { "filer-info-text": true } }, `${this.list.info.elapse.toFixed(0)}ms`),
						...(0 < this.list.info.error
							? [
								vue.h("span", { class: { "filer-info-icon": true } }, Font.Icon.CircleSlash),
								vue.h("span", { class: { "filer-info-text": true } }, this.list.info.error),
							]
							: []),
					]
					: undefined,
			),
			vue.h(
				TAG_STAT,
				{
					class: {
						"filer-stat": true,
						"filer-stat-active": this.list.stat.active,
						"filer-stat-target": this.list.stat.target,
					},
				},
				this.list.search
					? vue.h("div", { class: { "filer-prog": true } }, undefined)
					: undefined,
			),
			vue.h(
				TAG_DATA,
				{ ref: DATA, class: { "filer-data": true } },
				this.cell.map((cell, i) => {
					return vue.h(CellComponent.V, { key: this.ctop + i, cell })
				}),
			),
			vue.h(
				TAG_SCROLL,
				{ class: { "filer-scroll": true } },
				this.list.stat.active
					? vue.h("div", {
						class: { "filer-knob": true },
						style: { top: `${this.list.knob.pos}px`, height: `${this.list.knob.size}px` },
					})
					: undefined,
			),
		])
	},
})
