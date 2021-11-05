import * as vue from "vue"
import * as _ from 'lodash-es'

import * as Bridge from '@bridge/Bridge'

import root from '@renderer/Root'
import * as FilerProvider from '@renderer/fragment/filer/FilerProvider'
import * as ListComponent from '@renderer/fragment/filer/ListComponent'

type reactive = {
	ready: boolean
}

export const TAG = "filer"

export const V = vue.defineComponent({

	setup() {
		const el = vue.ref<HTMLElement>()

		const provider = FilerProvider.create()
		// vue.provide(FilerProvider.KEY, provider)

		const reactive = vue.reactive<reactive>({
			ready: false,
		})

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

		const _mounted = () => {
			let r: DOMRect = el.value!.getBoundingClientRect()
			root
				.invoke<Bridge.Filer.Resize.Send, Bridge.Filer.Style.Data>({
					ch: 'filer-resize',
					args: [
						-1,
						{
							event: "mounted",
							root: {
								x: r.x,
								y: r.y,
								w: r.width,
								h: r.height,
							}
						}
					]
				})
				.then((data: Bridge.Filer.Style.Data) => {
					let e = document.querySelector<HTMLElement>(":root")
					e?.style.setProperty("--dynamic-filer-font-size", data.fontSize)
					e?.style.setProperty("--dynamic-filer-line-height", data.lineHeight)
					reactive.ready = true
				})
		}

		vue.onMounted(() => {
			_mounted()
		})

		return {
			el,
			provider,
			reactive,
		}
	},

	render() {
		return vue.h(TAG, { ref: "el", class: { "filer-fragment": true } },
			this.reactive.ready
				? _.map(_.range(3), (i) => {
					return vue.h(ListComponent.V, { list: this.provider.reactive[i] })
				})
				: [])
	}

})
