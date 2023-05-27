import * as vue from "@/renderer/Vue"

import * as Bridge from "@/bridge/Bridge"
import * as SystemProvider from "@/renderer/fragment/system/SystemProvider"
import root from "@/renderer/Root"

const TAG = "system"

export const V = vue.defineComponent({
	setup() {
		const el = vue.ref<HTMLElement>()
		const sys = SystemProvider.inject()

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
					sys.reactive.styleFontSize = data.fontSize
					sys.reactive.styleLineHeight = data.lineHeight
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
			undefined,
		)
	},
})
