import * as Native from "@eyna/native/lib/renderer"
import * as Util from "@eyna/util"
import * as vue from "@vue/runtime-dom"

import * as Bridge from "@/bridge/Bridge"
import * as CellComponent from "@/renderer/fragment/filer/CellComponent"
import * as ListComponent from "@/renderer/fragment/filer/ListComponent"

type Title = {
	wd: string
	attr: Native.Attributes
}

type List = {
	i: number
	list: ListComponent.List
	ctop: number
	cell: CellComponent.Cell[]
}

type Reactive = {
	title: Title
	list: List[]
}

const KEY: vue.InjectionKey<ReturnType<typeof _create>> = Symbol("FilerProvider")

function _create(count: number) {
	const _data = Util.array<Bridge.List.Data>(0, count, (_) => {
		return Bridge.List.InitData()
	})
	const _time = Util.array<NodeJS.Timeout>(0, count, (_) => {
		return undefined
	})

	const reactive = vue.reactive<Reactive>({
		title: {
			wd: "",
			attr: [],
		},
		list: Util.array<List>(0, count, (i) => {
			return {
				i,
				list: ListComponent.InitList(),
				ctop: 0,
				cell: [],
			}
		}),
	})

	const updateChange = (i: number, data: Bridge.List.Change.Data) => {
		_data[i]! = vue.markRaw(data)

		clearTimeout(_time[i])
		_time[i] = setTimeout(() => {
			_update(i)
		}, 50)
	}

	const updateScan = (i: number, data: Bridge.List.Scan.Data) => {
		_data[i]! = vue.markRaw(data)

		clearTimeout(_time[i])
		_time[i] = setTimeout(() => {
			_update(i)
		}, 50)
	}

	const updateActive = (i: number, data: Bridge.List.Active.Data) => {
		_data[i]!.status = data.status

		clearTimeout(_time[i])
		_update(i)
	}

	const updateCursor = (i: number, data: Bridge.List.Cursor.Data) => {
		_data[i]!.cursor = data.cursor
		_data[i]!.drawCount = data.drawCount
		_data[i]!.drawIndex = data.drawIndex
		_data[i]!.drawPosition = data.drawPosition
		_data[i]!.drawSize = data.drawSize
		_data[i]!.knobPosition = data.knobPosition
		_data[i]!.knobSize = data.knobSize

		clearTimeout(_time[i])
		_update(i)
	}

	const updateAttribute = (i: number, data: Bridge.List.Attribute.Data) => {
		for (const [k, v] of Object.entries(data._slice)) {
			_data[i]!.ls[Number(k)] = v
		}

		clearTimeout(_time[i])
		_update(i)
	}

	const updateMark = (i: number, data: Bridge.List.Mark.Data) => {
		for (const [k, v] of Object.entries(data._slice)) {
			_data[i]!.mk[Number(k)] = v
		}

		clearTimeout(_time[i])
		_update(i)
	}

	const updateWatch = (i: number, data: Bridge.List.Watch.Data) => {
		_data[i]!.watch = data.watch

		reactive.list[i]!.list.info.sync = _data[i]!.watch == 0
	}

	const _update = (i: number) => {
		const d = _data[i]!
		const r = reactive.list[i]!

		r.list.wd = d.wd
		r.list.st = d.st
		r.list.search = d.search
		r.list.info.show = !d.search && d.wd != "home"
		r.list.info.sync = d.watch == 0
		r.list.info.mark = Util.count(d.mk, (mk) => mk)
		r.list.info.total = d.length
		r.list.info.error = d.error
		r.list.info.elapse = d.elapse
		r.list.stat.status = d.status
		r.list.stat.active = d.status == Bridge.Status.Active
		r.list.stat.target = d.status == Bridge.Status.Target
		r.list.knob.pos = d.knobPosition
		r.list.knob.size = d.knobSize

		r.ctop = d.drawIndex
		r.cell = Util.array<CellComponent.Cell>(
			0,
			d.drawCount,
			(j) => {
				const k = d.drawIndex + j
				const t = d.drawPosition + j * d.drawSize
				const s = d.mk?.[k] ?? false
				const c = d.status == Bridge.Status.Active && d.cursor == k
				return {
					style: {
						top: `${t}px`,
					},
					back: {
						select: s,
						cursor: c,
					},
					attr: vue.markRaw(d.ls?.[k] ?? []),
				}
			},
		)

		if (d.status == Bridge.Status.Active) {
			reactive.title.wd = d.wd
			reactive.title.attr = vue.markRaw(d.ls?.[d.cursor] ?? d.st)
		}
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

export function inject(): ReturnType<typeof _create> {
	return vue.inject(KEY)!
}
