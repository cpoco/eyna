import * as _ from "lodash-es"
import * as vue from "vue"

import * as Bridge from "@bridge/Bridge"
import * as Native from "@module/native/ts/renderer"

export type List = {
	i: number
	data: Bridge.List.Data
	make: number
	cell: Cell[]
}

export type Cell = {
	class: {
		"filer-cell": boolean
		"filer-cell-selcur": boolean
		"filer-cell-select": boolean
		"filer-cell-cursor": boolean
	}
	style: {
		top: string
	}
	attr: Native.Attributes
}

const KEY: vue.InjectionKey<ReturnType<typeof _create>> = Symbol("FilerProvider")

function _create(count: number) {
	const reactive = vue.reactive({
		list: _.map<number, List>(_.range(count), (i) => {
			return {
				i,
				data: Bridge.List.InitData(),
				make: 0,
				cell: [],
			}
		}),
	})

	const updateChange = (i: number, data: Bridge.List.Change.Data) => {
		reactive.list[i]!.data = data
		_update(i)
	}

	const updateScan = (i: number, data: Bridge.List.Change.Data) => {
		reactive.list[i]!.data = data
		reactive.list[i]!.data.ls = _.map<number, Native.Attributes>(_.range(data.length), () => [])
		reactive.list[i]!.data.mk = _.map<number, boolean>(_.range(data.length), () => false)
		_update(i)
	}

	const updateActive = (i: number, data: Bridge.List.Active.Data) => {
		reactive.list[i]!.data.status = data.status
		_update(i)
	}

	const updateCursor = (i: number, data: Bridge.List.Cursor.Data) => {
		reactive.list[i]!.data.cursor = data.cursor
		reactive.list[i]!.data.drawCount = data.drawCount
		reactive.list[i]!.data.drawIndex = data.drawIndex
		reactive.list[i]!.data.drawPosition = data.drawPosition
		reactive.list[i]!.data.drawSize = data.drawSize
		reactive.list[i]!.data.knobPosition = data.knobPosition
		reactive.list[i]!.data.knobSize = data.knobSize
		_update(i)
	}

	const updateAttribute = (i: number, data: Bridge.List.Attribute.Data) => {
		_.forEach<Bridge.List.Attribute.Slice>(data._slice, (v, j) => {
			reactive.list[i]!.data.ls[Number(j)]!.length = 0
			reactive.list[i]!.data.ls[Number(j)]!.push(...v)
		})
		_update(i)
	}

	const updateMark = (i: number, data: Bridge.List.Mark.Data) => {
		_.forEach<Bridge.List.Mark.Slice>(data._slice, (v, j) => {
			reactive.list[i]!.data.mk[Number(j)] = v.mk
		})
		_update(i)
	}

	const updateWatch = (i: number, data: Bridge.List.Watch.Data) => {
		reactive.list[i]!.data.watch = data.watch
	}

	const _update = (i: number) => {
		reactive.list[i]!.make = _.reduce<boolean, number>(reactive.list[i]!.data.mk, (cnt, mk) => {
			return mk ? cnt + 1 : cnt
		}, 0)
		reactive.list[i]!.cell = _.map<number, Cell>(
			_.range(reactive.list[i]!.data.drawCount),
			(j): Cell => {
				const k = reactive.list[i]!.data.drawIndex + j
				const t = reactive.list[i]!.data.drawPosition + j * reactive.list[i]!.data.drawSize
				const s = reactive.list[i]!.data.mk[k]!
				const c = reactive.list[i]!.data.status == Bridge.Status.active && reactive.list[i]!.data.cursor == k
				return {
					class: {
						"filer-cell": true,
						"filer-cell-selcur": s && c,
						"filer-cell-select": s && !c,
						"filer-cell-cursor": !s && c,
					},
					style: { top: `${t}px` },
					attr: reactive.list[i]!.data.ls[k]!,
				}
			},
		)
	}

	return {
		reactive,
		updateChange,
		updateScan,
		updateActive,
		updateCursor,
		updateAttribute,
		updateMark,
		updateWatch,
	}
}

export function create(count: number): ReturnType<typeof _create> {
	const v = _create(count)
	vue.provide(KEY, v)
	return v
}

// export function inject(): ReturnType<typeof _create> {
// 	return vue.inject(KEY)!
// }
