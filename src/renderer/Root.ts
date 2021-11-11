import * as vue from "vue"

import * as electron from 'electron'
import * as _ from 'lodash-es'

import * as Bridge from '@bridge/Bridge'
import * as FilerFragment from '@renderer/fragment/filer/FilerFragment'
 import * as ModalFragment from '@renderer/fragment/modal/ModalFragment'

const V = vue.defineComponent({

	render() {
		return vue.h("root", {}, [
			vue.h(FilerFragment.V),
			vue.h(ModalFragment.V),
		])
	}

})

class Root {

	create() {
		window.onload = () => {
			vue.createApp(V).mount(document.getElementsByTagName('body')[0])
		}

		this.on(Bridge.Root.Clipboard.CH, (_: number, data: Bridge.Root.Clipboard.Data) => {
			document.execCommand(data.command)
		})
	}

	on<T, U>(ch: string, listener: (i: T, data: U) => void): Root {
		electron.ipcRenderer.on(ch, (_event: electron.IpcRendererEvent, ...args: [T, U]) => {
			console.log(ch, args[0], args[1])
			listener(args[0], args[1])
		})
		return this
	}

	send<T extends Bridge.Base.Send>(send: T) {
		console.log(send.ch, send.args[0], send.args[1])
		electron.ipcRenderer.send(send.ch, ...send.args)
	}

	invoke<T extends Bridge.Base.Send, U>(send: T): Promise<U> {
		console.log(send.ch, send.args[0], send.args[1])
		return electron.ipcRenderer.invoke(send.ch, ...send.args)
	}

}

export default new Root()
