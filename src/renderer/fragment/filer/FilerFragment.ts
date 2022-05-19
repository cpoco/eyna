import * as _ from "lodash-es"
import * as vue from "vue"

import * as Conf from "@app/Conf"
import * as Bridge from "@bridge/Bridge"
import * as FilerProvider from "@renderer/fragment/filer/FilerProvider"
import * as ListComponent from "@renderer/fragment/filer/ListComponent"
import root from "@renderer/Root"

const TAG = "filer"

export const V = vue.defineComponent({
	setup() {
		const filer = FilerProvider.create(Conf.LIST_COUNT)

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
		}
	},

	render() {
		return vue.h(
			TAG,
			{ class: { "filer-fragment": true } },
			_.map<FilerProvider.List, vue.VNode>(this.filer.list, (list) => {
				return vue.h(ListComponent.V, { list })
			}),
		)
	},
})
