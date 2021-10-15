import * as process from 'process'

export namespace Platform {
	export const win: boolean = (process.platform == 'win32')
	export const mac: boolean = (process.platform == 'darwin')
}
