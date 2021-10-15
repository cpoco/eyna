import * as electron from 'electron'

import * as Native from '@module/native/ts/browser'

import * as Bridge from '@bridge/Bridge'

import root from '@browser/Root'

import { AbstractFragment } from '@browser/fragment/AbstractFragment'

export class SystemFragment extends AbstractFragment {

	constructor() {
		super()

		this.ipc()
		this.command()
	}

	private ipc() {
	}

	private command() {
		this
			.on('system.copy', () => {
				root.send<Bridge.Root.Clipboard.Send>({
					ch: 'root-clipboard',
					args: [
						-1,
						{
							command: "copy"
						},
					]
				})
				return Promise.resolve()
			})
			.on('system.exit', () => {
				root.quit()
				return Promise.resolve()
			})
			.on('system.reload', () => {
				root.reload()
				return Promise.resolve()
			})
			.on('system.version', () => {
				root.showMessageBox([
					`version: ${electron.app.getVersion()}`,
					`admin: ${Native.isElevated()}`,
					"",
					`electron: ${process.versions.electron}`,
					`node: ${process.versions.node}`,
					`chrome: ${process.versions.chrome}`,
					`v8: ${process.versions.v8}`,
				].join('\n'))
				return Promise.resolve()
			})
			.on('system.devtool', () => {
				root.devTools()
				return Promise.resolve()
			})
	}
}
