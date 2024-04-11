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
				sys.reactive.app.active = data
			})
			.on(Bridge.System.Version.CH, (_i: number, data: Bridge.System.Version.Data) => {
				sys.reactive.dialog.version = data
			})

		const _mounted = () => {
			let r: DOMRect = el.value!.getBoundingClientRect()
			root
				.invoke<Bridge.System.Dom.Send, Bridge.System.Dom.Result>({
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
				.then((data: Bridge.System.Dom.Result) => {
					root.log("ipc.invoke.result", data)
					sys.reactive.app = data.app
					sys.reactive.dialog = data.dialog
					sys.reactive.style = data.style
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

		const show = (v: boolean) => {
			if (v) {
				el.value!.showModal()
			}
			else {
				el.value!.close()
			}
		}

		vue.onMounted(() => {
			show(sys.reactive.dialog.version)
		})

		vue.watch(
			() => {
				return sys.reactive.dialog.version
			},
			(v) => {
				show(v)
			},
		)

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
