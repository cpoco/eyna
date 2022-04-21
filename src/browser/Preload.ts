import * as electron from "electron"
import * as fs from "fs/promises"

electron.contextBridge.exposeInMainWorld("fs", {
	read,
})

function read(abstract: string): Promise<ArrayBuffer> {
	return fs.readFile(abstract)
}

electron.contextBridge.exposeInMainWorld("ipc", {
	on,
	send,
	invoke,
})

function on(channel: string, listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void) {
	electron.ipcRenderer.on(channel, listener)
}

function send(channel: string, ...args: any[]) {
	electron.ipcRenderer.send(channel, ...args)
}

function invoke<T>(channel: string, ...args: any[]): Promise<T> {
	return electron.ipcRenderer.invoke(channel, ...args)
}
