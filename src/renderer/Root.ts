import * as vue from "vue"
// import * as dev from "@vue/devtools"

import * as Bridge from "@/bridge/Bridge"
import * as FilerFragment from "@/renderer/fragment/filer/FilerFragment"
import * as ModalFragment from "@/renderer/fragment/modal/ModalFragment"
import * as SystemFragment from "@/renderer/fragment/system/SystemFragment"
import * as SystemProvider from "@/renderer/fragment/system/SystemProvider"
import * as ViewerFragment from "@/renderer/fragment/viewer/ViewerFragment"

declare global {
	interface Window {
		ipc: {
			on: (channel: string, listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => void
			send: (channel: string, ...args: any[]) => void
			invoke: <T>(channel: string, ...args: any[]) => Promise<T>
		}
	}
}

const V = vue.defineComponent({
	setup() {
		const sys = SystemProvider.create()

		return {
			sys: sys.reactive,
		}
	},

	render() {
		const node = [
			vue.h(SystemFragment.V),
		]

		if (this.sys.ready) {
			node.push(
				vue.h(FilerFragment.V),
				vue.h(ModalFragment.V),
				vue.h(ViewerFragment.V),
			)
		}

		return vue.h("root", undefined, node)
	},
})

class Root {
	create() {
		window.onload = () => {
			vue.createApp(V).mount(document.getElementsByTagName("body")[0]!)
			// dev.connect()
		}
	}

	on<T, U>(ch: string, listener: (i: T, data: U) => void): Root {
		window.ipc.on(ch, (_event: Electron.IpcRendererEvent, ...args: [T, U]) => {
			this.log("ipc.on", ch, args[0], args[1])
			listener(args[0], args[1])
		})
		return this
	}

	send<T extends Bridge.Base.Send>(send: T) {
		this.log("ipc.send", send.ch, send.args[0], send.args[1])
		window.ipc.send(send.ch, ...send.args)
	}

	invoke<T extends Bridge.Base.Send, U>(send: T): Promise<U> {
		this.log("ipc.invoke", send.ch, send.args[0], send.args[1])
		return window.ipc.invoke<U>(send.ch, ...send.args)
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
