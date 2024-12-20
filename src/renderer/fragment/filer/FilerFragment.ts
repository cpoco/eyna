import * as vue from "@vue/runtime-dom"

import * as Bridge from "@/bridge/Bridge"
import * as FilerProvider from "@/renderer/fragment/filer/FilerProvider"
import * as ListComponent from "@/renderer/fragment/filer/ListComponent"
import root from "@/renderer/Root"

const TAG = "filer"

export const V = vue.defineComponent({
	setup() {
		const filer = FilerProvider.inject()

		const style = vue.computed<vue.StyleValue>(() => {
			const row = "1fr"
			const col = filer.reactive.list.map(() => {
				return "1fr"
			}).join(" ")
			return {
				gridTemplate: `${row} / ${col}`,
			}
		})

		root
			.on(Bridge.List.Change.CH, (i: number, data: Bridge.List.Change.Data) => {
				filer.updateChange(i, data)
			})
			.on(Bridge.List.Scan.CH, (i: number, data: Bridge.List.Scan.Data) => {
				filer.updateScan(i, data)
			})
			.on(Bridge.List.Active.CH, (i: number, data: Bridge.List.Active.Data) => {
				filer.updateActive(i, data)
			})
			.on(Bridge.List.Cursor.CH, (i: number, data: Bridge.List.Cursor.Data) => {
				filer.updateCursor(i, data)
			})
			.on(Bridge.List.Attribute.CH, (i: number, data: Bridge.List.Attribute.Data) => {
				filer.updateAttribute(i, data)
			})
			.on(Bridge.List.Mark.CH, (i: number, data: Bridge.List.Mark.Data) => {
				filer.updateMark(i, data)
			})
			.on(Bridge.List.Watch.CH, (i: number, data: Bridge.List.Watch.Data) => {
				filer.updateWatch(i, data)
			})

		return {
			filer: filer.reactive,
			style: style,
		}
	},

	render() {
		return vue.h(
			TAG,
			{ class: { "filer-fragment": true }, style: this.style },
			this.filer.list.map((ls) => {
				return vue.h(ListComponent.V, {
					i: ls.i,
					list: ls.list,
					ctop: ls.ctop,
					cell: ls.cell,
				})
			}),
		)
	},
})
