import * as vue from "vue"

import * as Bridge from "@bridge/Bridge"
import * as Font from "@renderer/dom/Font"
import * as Unicode from "@renderer/dom/Unicode"
import * as CellComponent from "@renderer/fragment/filer/CellComponent"
import * as FilerProvider from "@renderer/fragment/filer/FilerProvider"
import * as SpinnerComponent from "@renderer/fragment/filer/SpinnerComponent"
import root from "@renderer/Root"

const TAG = "list"

const TAG_INFO = "info"
const TAG_STAT = "stat"
const TAG_DATA = "data"
const TAG_SCROLL = "scroll"

export const V = vue.defineComponent({
	props: {
		list: {
			required: true,
			type: Object as vue.PropType<FilerProvider.List>,
		},
	},

	setup(props) {
		const el = vue.ref<HTMLElement>() // data.filer-data

		const _mounted = () => {
			let d: DOMRect = el.value!.getBoundingClientRect()
			root.send<Bridge.List.Dom.Send>({
				ch: "filer-dom",
				args: [
					props.list.i,
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
					props.list.i,
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
		let active = this.list.data.status == Bridge.Status.active
		let target = this.list.data.status == Bridge.Status.target

		let cnt = this.list.data.length < 0
			? vue.h(SpinnerComponent.V)
			: [
				vue.h("span", { class: { "filer-cicon": true } }, this.list.data.watch ? Font.sync_ignored : Font.sync),
				vue.h("span", {}, `${this.list.make}/${this.list.data.length} `),
				vue.h("span", { class: { "filer-cicon": true } }, Font.circle_slash),
				vue.h("span", {}, this.list.data.error),
			]

		return vue.h(TAG, { class: { "filer-list": true } }, [
			vue.h(TAG_INFO, { class: { "filer-info": true } }, [
				vue.h("div", { class: { "filer-dir": true } }, Unicode.rol(this.list.data.wd)),
				vue.h("div", { class: { "filer-cnt": true } }, cnt),
			]),
			vue.h(TAG_STAT, {
				class: { "filer-stat": true, "filer-stat-active": active, "filer-stat-target": target },
			}),
			vue.h(TAG_DATA, { ref: "el", class: { "filer-data": true } }, [
				this.list.cell.map((cell) => {
					return vue.h(CellComponent.V, { cell })
				}),
			]),
			vue.h(
				TAG_SCROLL,
				{ class: { "filer-scroll": true } },
				active
					? vue.h("div", {
						class: { "filer-knob": true },
						style: { top: `${this.list.data.knobPosition}px`, height: `${this.list.data.knobSize}px` },
					})
					: undefined,
			),
		])
	},
})
