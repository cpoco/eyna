import * as _ from "lodash-es"
import * as vue from "vue"

import * as Bridge from "@bridge/Bridge"
import * as FilerFragment from "@renderer/fragment/filer/FilerFragment"
import * as ModalFragment from "@renderer/fragment/modal/ModalFragment"

declare global {
	interface Window {
		fs: {
			read: (abstract: string) => Promise<ArrayBuffer>
		}
		ipc: {
			on: (channel: string, listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => void
			send: (channel: string, ...args: any[]) => void
			invoke: <T>(channel: string, ...args: any[]) => Promise<T>
		}
	}
}

const V = vue.defineComponent({
	render() {
		return vue.h("root", undefined, [
			vue.h(FilerFragment.V),
			vue.h(ModalFragment.V),
		])
	},
})

class Root {
	create() {
		window.onload = () => {
			vue.createApp(V).mount(document.getElementsByTagName("body")[0]!)
		}
	}

	on<T, U>(ch: string, listener: (i: T, data: U) => void): Root {
		window.ipc.on(ch, (_event: Electron.IpcRendererEvent, ...args: [T, U]) => {
			console.log(ch, args[0], args[1])
			listener(args[0], args[1])
		})
		return this
	}

	send<T extends Bridge.Base.Send>(send: T) {
		console.log(send.ch, send.args[0], send.args[1])
		window.ipc.send(send.ch, ...send.args)
	}

	invoke<T extends Bridge.Base.Send, U>(send: T): Promise<U> {
		console.log(send.ch, send.args[0], send.args[1])
		return window.ipc.invoke<U>(send.ch, ...send.args)
	}
}

export default new Root()
