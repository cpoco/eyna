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
		"filer-cell-select": boolean
		"filer-cell-cursor": boolean
	}
	style: {
		top: string
	}
	attr: Native.Attributes
}

export const KEY: vue.InjectionKey<ReturnType<typeof create>> = Symbol("FilerProvider")

export function create(count: number) {
	const reactive = vue.reactive<List[]>(
		_.map<number, List>(_.range(count), (i) => {
			return {
				i,
				data: Bridge.List.InitData(),
				make: 0,
				cell: [],
			}
		}),
	)

	const updateChange = (i: number, data: Bridge.List.Change.Data) => {
		reactive[i]!.data = data
		_update(i)
	}

	const updateScan = (i: number, data: Bridge.List.Change.Data) => {
		reactive[i]!.data = data
		reactive[i]!.data.ls = _.map<number, Native.Attributes>(_.range(data.length), () => [])
		reactive[i]!.data.mk = _.map<number, boolean>(_.range(data.length), () => false)
		_update(i)
	}

	const updateActive = (i: number, data: Bridge.List.Active.Data) => {
		reactive[i]!.data.status = data.status
		_update(i)
	}

	const updateCursor = (i: number, data: Bridge.List.Cursor.Data) => {
		reactive[i]!.data.cursor = data.cursor
		reactive[i]!.data.drawCount = data.drawCount
		reactive[i]!.data.drawIndex = data.drawIndex
		reactive[i]!.data.drawPosition = data.drawPosition
		reactive[i]!.data.drawSize = data.drawSize
		reactive[i]!.data.knobPosition = data.knobPosition
		reactive[i]!.data.knobSize = data.knobSize
		_update(i)
	}

	const updateAttribute = (i: number, data: Bridge.List.Attribute.Data) => {
		if (reactive[i]!.data.update == data.update) {
			_.forEach<Bridge.List.Attribute.Slice>(data._slice, (v, j) => {
				reactive[i]!.data.ls[Number(j)]!.length = 0
				reactive[i]!.data.ls[Number(j)]!.push(...v.ls)
			})
			_update(i)
		}
	}

	const updateMark = (i: number, data: Bridge.List.Mark.Data) => {
		if (reactive[i]!.data.update == data.update) {
			_.forEach<Bridge.List.Mark.Slice>(data._slice, (v, j) => {
				reactive[i]!.data.mk[Number(j)] = v.mk
			})
			_update(i)
		}
	}

	const _update = (i: number) => {
		reactive[i]!.make = _.reduce<boolean, number>(reactive[i]!.data.mk, (cnt, mk) => {
			return mk ? cnt + 1 : cnt
		}, 0)
		reactive[i]!.cell = _.map<number, Cell>(
			_.range(reactive[i]!.data.drawCount),
			(j): Cell => {
				let k = reactive[i]!.data.drawIndex + j
				let t = reactive[i]!.data.drawPosition + j * reactive[i]!.data.drawSize
				return {
					class: {
						"filer-cell": true,
						"filer-cell-select": reactive[i]!.data.mk[k]!,
						"filer-cell-cursor": reactive[i]!.data.status == Bridge.Status.active
							&& reactive[i]!.data.cursor == k,
					},
					style: { top: `${t}px` },
					attr: reactive[i]!.data.ls[k]!,
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
	}
}
