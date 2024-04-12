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
				sys.reactive.overlay.version = data
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
					sys.reactive.overlay = data.overlay
					sys.reactive.style = data.style
				})
		}

		vue.onMounted(() => {
			_mounted()
		})

		return {
			el,
			sys: sys.reactive,
		}
	},

	render() {
		return vue.h(
			TAG,
			{ ref: "el", class: { "system-fragment": true } },
			this.sys.overlay.version ? vue.h(overlay) : undefined,
		)
	},
})

const overlay = vue.defineComponent({
	setup() {
		const ver = vue.ref<string>("")
		const met = vue.ref<string>("")

		let id: NodeJS.Timeout

		vue.onMounted(() => {
			fetch("eyna://versions/")
				.then((res) => {
					return res.json()
				})
				.then((json: versions) => {
					ver.value = [
						` version: ${json.app.version}`,
						`electron: ${json.system.electron}`,
						`    node: ${json.system.node}`,
						`  chrome: ${json.system.chrome}`,
						`      v8: ${json.system.v8}`,
					].join("\n")
				})

			id = setInterval(() => {
				fetch("eyna://metrics/")
					.then((res) => {
						return res.json()
					})
					.then((json: metrics) => {
						const line: string[] = []
						for (const m of json.metrics) {
							line.push(`${m.type.padStart(7, " ")}:${m.memory.workingSetSize.toLocaleString().padStart(10, " ")} KB`)
						}
						met.value = line.join("\n")
					})
			}, 1000)
		})

		vue.onUnmounted(() => {
			clearInterval(id)
		})

		return {
			ver,
			met,
		}
	},

	render() {
		return vue.h(
			"overlay",
			{
				class: { "system-overlay": true },
			},
			[
				vue.h("pre", { class: { "system-overlay-item": true } }, this.ver),
				vue.h("pre", { class: { "system-overlay-item": true } }, this.met),
			],
		)
	},
})

type versions = {
	app: {
		version: string
		admin: boolean
	}
	system: {
		electron: string
		node: string
		chrome: string
		v8: string
	}
}

type metrics = {
	metrics: {
		type: string
		pid: number
		memory: {
			workingSetSize: number
			peakWorkingSetSize: number
		}
	}[]
}
