type Func = (...args: string[]) => Promise<void>

export abstract class AbstractFragment {
	private func: Map<string, Func> = new Map()

	constructor() {
	}

	on(cmd: string, func: Func): AbstractFragment {
		this.func.set(cmd, func)
		return this
	}

	emit(cmd: string, ...args: string[]): Promise<void> {
		const func = this.func.get(cmd)
		if (!func) {
			return Promise.reject("command not found")
		}
		try {
			return func(...args)
		}
		catch (err) {
			return Promise.reject(err)
		}
	}
}
