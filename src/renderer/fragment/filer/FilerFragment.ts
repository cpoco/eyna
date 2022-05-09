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
		const provider = FilerProvider.provide(Conf.LIST_COUNT)

		root
			.on(Bridge.List.Change.CH, (i: number, data: Bridge.List.Change.Data) => {
				provider.updateChange(i, data)
			})
			.on(Bridge.List.Scan.CH, (i: number, data: Bridge.List.Scan.Data) => {
				provider.updateScan(i, data)
			})
			.on(Bridge.List.Active.CH, (i: number, data: Bridge.List.Active.Data) => {
				provider.updateActive(i, data)
			})
			.on(Bridge.List.Cursor.CH, (i: number, data: Bridge.List.Cursor.Data) => {
				provider.updateCursor(i, data)
			})
			.on(Bridge.List.Attribute.CH, (i: number, data: Bridge.List.Attribute.Data) => {
				provider.updateAttribute(i, data)
			})
			.on(Bridge.List.Mark.CH, (i: number, data: Bridge.List.Mark.Data) => {
				provider.updateMark(i, data)
			})

		return {
			provider,
		}
	},

	render() {
		return vue.h(
			TAG,
			{ class: { "filer-fragment": true } },
			_.map<FilerProvider.List, vue.VNode>(this.provider.reactive, (list) => {
				return vue.h(ListComponent.V, { list })
			}),
		)
	},
})
