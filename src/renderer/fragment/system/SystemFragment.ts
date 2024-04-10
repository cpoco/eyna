import * as vue from "@vue/runtime-dom"

import * as Bridge from "@/bridge/Bridge"
import * as SystemProvider from "@/renderer/fragment/system/SystemProvider"
import root from "@/renderer/Root"

const TAG = "system"

export const V = vue.defineComponent({
	setup() {
		const el = vue.ref<HTMLElement>()
		const sys = SystemProvider.inject()

		root
			.on(Bridge.System.Active.CH, (_i: number, data: Bridge.System.Active.Data) => {
				sys.reactive.active = data
			})
			.on(Bridge.System.Dialog.CH, (_i: number, data: Bridge.System.Dialog.Data) => {
				sys.reactive.dialog = data
			})

		const _mounted = () => {
			let r: DOMRect = el.value!.getBoundingClientRect()
			root
				.invoke<Bridge.System.Dom.Send, Bridge.System.Style.Data>({
					ch: "system-dom",
					args: [
						-1,
						{
							event: "mounted",
							root: {
								x: r.x,
								y: r.y,
								w: r.width,
								h: r.height,
							},
						},
					],
				})
				.then((data: Bridge.System.Style.Data) => {
					root.log("ipc.invoke.result", data)
					sys.reactive.ready = true
					sys.reactive.active = data.active
					sys.reactive.dialog = data.dialog
					sys.reactive.dynamicFontSize = data.fontSize
					sys.reactive.dynamicLineHeight = data.lineHeight
				})
		}

		vue.onMounted(() => {
			_mounted()
		})

		return {
			el,
		}
	},

	render() {
		return vue.h(
			TAG,
			{ ref: "el", class: { "system-fragment": true } },
			vue.h(dialog),
		)
	},
})

const dialog = vue.defineComponent({
	setup() {
		const el = vue.ref<HTMLDialogElement>()
		const sys = SystemProvider.inject()
		const refs = vue.toRefs(sys.reactive)

		const show = (v: boolean) => {
			if (v) {
				el.value!.showModal()
			}
			else {
				el.value!.close()
			}
		}

		vue.onMounted(() => {
			show(refs.dialog.value)
		})

		vue.watch(refs.dialog, (v) => {
			show(v)
		})

		return {
			el,
		}
	},

	render() {
		return vue.h(
			"dialog",
			{
				ref: "el",
				class: { "system-dialog": true },
			},
			"WIP",
		)
	},
})
