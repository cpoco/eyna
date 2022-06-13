import * as vue from "vue"

import * as Bridge from "@/bridge/Bridge"
import { Status, StatusValues } from "@/bridge/Status"
import * as Font from "@/renderer/dom/Font"
import * as Unicode from "@/renderer/dom/Unicode"
import * as CellComponent from "@/renderer/fragment/filer/CellComponent"
import * as SpinnerComponent from "@/renderer/fragment/filer/SpinnerComponent"
import root from "@/renderer/Root"

const TAG = "list"

const TAG_INFO = "info"
const TAG_STAT = "stat"
const TAG_DATA = "data"
const TAG_SCROLL = "scroll"

export type List = {
	wd: string
	sync: boolean
	status: StatusValues
	count: {
		mark: number
		total: number
		error: number
	}
	knob: {
		pos: number
		size: number
	}
}
export function InitList(): List {
	return {
		wd: "",
		sync: false,
		status: Status.none,
		count: {
			mark: 0,
			total: 0,
			error: 0,
		},
		knob: {
			pos: 0,
			size: 0,
		},
	}
}

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
		cell: {
			required: true,
			type: Object as vue.PropType<CellComponent.Cell[]>,
		},
	},

	setup(props) {
		const el = vue.ref<HTMLElement>() // data.filer-data

		const _mounted = () => {
			let d: DOMRect = el.value!.getBoundingClientRect()
			root.send<Bridge.List.Dom.Send>({
				ch: "filer-dom",
				args: [
					props.i,
					{
						event: "mounted",
						data: {
							x: d.x,
							y: d.y,
							w: d.width,
							h: d.height,
						},
					},
				],
			})
		}

		const _resized = () => {
			let d: DOMRect = el.value!.getBoundingClientRect()
			root.send<Bridge.List.Dom.Send>({
				ch: "filer-dom",
				args: [
					props.i,
					{
						event: "resized",
						data: {
							x: d.x,
							y: d.y,
							w: d.width,
							h: d.height,
						},
					},
				],
			})
		}

		vue.onMounted(() => {
			_mounted()
		})

		vue.onBeforeUnmount(() => {
			window.removeEventListener("resize", _resized)
		})

		window.addEventListener("resize", _resized)

		return {
			el,
		}
	},

	render() {
		let active = this.list.status == Bridge.Status.active
		let target = this.list.status == Bridge.Status.target

		let cnt = this.list.count.total < 0
			? vue.h(SpinnerComponent.V)
			: [
				vue.h("span", { class: { "filer-cicon": true } }, this.list.sync ? Font.sync : Font.sync_ignored),
				vue.h("span", {}, `${this.list.count.mark}/${this.list.count.total} `),
				vue.h("span", { class: { "filer-cicon": true } }, Font.circle_slash),
				vue.h("span", {}, this.list.count.error),
			]

		return vue.h(TAG, { class: { "filer-list": true } }, [
			vue.h(TAG_INFO, { class: { "filer-info": true } }, [
				vue.h("div", { class: { "filer-dir": true } }, Unicode.rol(this.list.wd)),
				vue.h("div", { class: { "filer-cnt": true } }, cnt),
			]),
			vue.h(TAG_STAT, {
				class: { "filer-stat": true, "filer-stat-active": active, "filer-stat-target": target },
			}),
			vue.h(TAG_DATA, { ref: "el", class: { "filer-data": true } }, [
				this.cell.map((cell) => {
					return vue.h(CellComponent.V, { cell })
				}),
			]),
			vue.h(
				TAG_SCROLL,
				{ class: { "filer-scroll": true } },
				active
					? vue.h("div", {
						class: { "filer-knob": true },
						style: { top: `${this.list.knob.pos}px`, height: `${this.list.knob.size}px` },
					})
					: undefined,
			),
		])
	},
})
