import { contextBridge, ipcRenderer } from "electron"

contextBridge.exposeInMainWorld("ipc", {
	on,
	send,
	invoke,
})

function on(channel: string, listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void) {
	ipcRenderer.on(channel, listener)
}

function send(channel: string, ...args: any[]) {
	ipcRenderer.send(channel, ...args)
}

function invoke<T>(channel: string, ...args: any[]): Promise<T> {
	return ipcRenderer.invoke(channel, ...args)
}
