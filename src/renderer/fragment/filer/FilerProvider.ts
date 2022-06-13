import * as vue from "vue"

import * as Bridge from "@/bridge/Bridge"
import * as CellComponent from "@/renderer/fragment/filer/CellComponent"
import * as ListComponent from "@/renderer/fragment/filer/ListComponent"
import * as Util from "@/util/Util"

type reactive = {
	data: Bridge.List.Data // raw
	i: number
	list: ListComponent.List
	cell: CellComponent.Cell[]
}

const KEY: vue.InjectionKey<ReturnType<typeof _create>> = Symbol("FilerProvider")

function _create(count: number) {
	const reactive = vue.reactive<reactive[]>(
		Util.array<reactive>(0, count, (i) => {
			return {
				data: vue.markRaw(Bridge.List.InitData()),
				i,
				list: ListComponent.InitList(),
				cell: [],
			}
		}),
	)

	const updateChange = (i: number, data: Bridge.List.Change.Data) => {
		reactive[i]!.data = vue.markRaw(data)
		_update(i)
	}

	const updateScan = (i: number, data: Bridge.List.Scan.Data) => {
		reactive[i]!.data = vue.markRaw(data)
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
		for (const [k, v] of Object.entries(data._slice)) {
			reactive[i]!.data.ls[Number(k)] = v
		}
		_update(i)
	}

	const updateMark = (i: number, data: Bridge.List.Mark.Data) => {
		for (const [k, v] of Object.entries(data._slice)) {
			reactive[i]!.data.mk[Number(k)] = v
		}
		_update(i)
	}

	const updateWatch = (i: number, data: Bridge.List.Watch.Data) => {
		reactive[i]!.data.watch = data.watch
	}

	const _update = (i: number) => {
		const r = reactive[i]!

		r.list.wd = r.data.wd
		r.list.sync = r.data.watch == 0
		r.list.status = r.data.status
		r.list.count.mark = Util.count(r.data.mk, (mk) => mk)
		r.list.count.total = r.data.length
		r.list.count.error = r.data.error
		r.list.knob.pos = r.data.knobPosition
		r.list.knob.size = r.data.knobSize

		r.cell = Util.array<CellComponent.Cell>(
			0,
			r.data.drawCount,
			(j) => {
				const k = r.data.drawIndex + j
				const t = r.data.drawPosition + j * r.data.drawSize
				const s = r.data.mk?.[k] ?? false
				const c = r.data.status == Bridge.Status.active && r.data.cursor == k
				return {
					class: {
						"filer-cell": true,
						"filer-cell-selcur": s && c,
						"filer-cell-select": s && !c,
						"filer-cell-cursor": !s && c,
					},
					style: { top: `${t}px` },
					attr: vue.markRaw(r.data.ls?.[k] ?? []),
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
