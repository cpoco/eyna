import * as vue from "@vue/runtime-dom"

import * as Conf from "@/app/Conf"
import * as Bridge from "@/bridge/Bridge"
import * as FilerFragment from "@/renderer/fragment/filer/FilerFragment"
import * as FilerProvider from "@/renderer/fragment/filer/FilerProvider"
import * as ModalFragment from "@/renderer/fragment/modal/ModalFragment"
import * as NavbarFragment from "@/renderer/fragment/navbar/NavbarFragment"
import * as SystemFragment from "@/renderer/fragment/system/SystemFragment"
import * as SystemProvider from "@/renderer/fragment/system/SystemProvider"
import * as ViewerFragment from "@/renderer/fragment/viewer/ViewerFragment"

declare global {
	interface Window {
		ipc: {
			on<T extends keyof Bridge.BrowserToRenderer>(
				channel: T,
				listener: (
					event: Electron.IpcRendererEvent,
					i: Bridge.BrowserToRenderer[T][0],
					data: Bridge.BrowserToRenderer[T][1],
				) => void,
			): void

			send<T extends keyof Bridge.RendererToBrowser>(
				channel: T,
				i: Bridge.RendererToBrowser[T][0],
				data: Bridge.RendererToBrowser[T][1],
			): void

			invoke: <T extends keyof Bridge.Invokel>(
				channel: T,
				i: Bridge.Invokel[T][0],
				data: Bridge.Invokel[T][1],
			) => Promise<Bridge.Invokel[T][2]>
		}
	}
}

const V = vue.defineComponent({
	setup() {
		const sys = SystemProvider.create()
		FilerProvider.create(Conf.LIST_COUNT)

		return {
			sys: sys.reactive,
		}
	},

	render() {
		return vue.h("root", undefined, [
			vue.h(SystemFragment.V),
			this.sys.app.ready ? vue.h(NavbarFragment.V) : undefined,
			this.sys.app.ready ? vue.h(FilerFragment.V) : undefined,
			this.sys.app.ready ? vue.h(ModalFragment.V) : undefined,
			this.sys.app.ready ? vue.h(ViewerFragment.V) : undefined,
		])
	},
})

class Root {
	create() {
		window.onload = () => {
			document.documentElement.style.setProperty(Conf.STYLE_NAVBAR_HEIGHT, `${Conf.NAVBAR_HEIGHT}px`)
			vue.createApp(V).mount("body")
		}

		window.addEventListener("cut", async (_: ClipboardEvent) => {
			await navigator.clipboard.writeText(await navigator.clipboard.readText())
		})

		window.addEventListener("copy", async (_: ClipboardEvent) => {
			await navigator.clipboard.writeText(await navigator.clipboard.readText())
		})
	}

	on<T extends keyof Bridge.BrowserToRenderer>(
		ch: T,
		listener: (
			i: Bridge.BrowserToRenderer[T][0],
			data: Bridge.BrowserToRenderer[T][1],
		) => void,
	): Root {
		window.ipc.on<T>(
			ch,
			(
				_event: Electron.IpcRendererEvent,
				i: Bridge.BrowserToRenderer[T][0],
				data: Bridge.BrowserToRenderer[T][1],
			) => {
				this.log("ipc.on", ch, i, data)
				listener(i, data)
			},
		)
		return this
	}

	send<T extends keyof Bridge.RendererToBrowser>(
		ch: T,
		i: Bridge.RendererToBrowser[T][0],
		data: Bridge.RendererToBrowser[T][1],
	) {
		this.log("ipc.send", ch, i, data)
		window.ipc.send<T>(ch, i, data)
	}

	invoke<T extends keyof Bridge.Invokel>(
		channel: T,
		i: Bridge.Invokel[T][0],
		data: Bridge.Invokel[T][1],
	): Promise<Bridge.Invokel[T][2]> {
		this.log("ipc.invoke", channel, i, data)
		return window.ipc.invoke<T>(channel, i, data)
	}

	log(label: string, ...agrs: any[]) {
		console.log(
			`%c${label}%c`,
			`color:#fff;background-color:#16A085;padding:2px;border-radius:2px;`,
			"",
			...agrs,
		)
	}
}

export default new Root()
