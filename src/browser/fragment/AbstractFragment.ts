export abstract class AbstractFragment {
	private func: { [cmd: string]: (...args: string[]) => Promise<void> } = {}

	constructor() {
	}

	on(cmd: string, func: (...args: string[]) => Promise<void>): AbstractFragment {
		this.func[cmd] = func
		return this
	}

	emit(cmd: string, ...args: string[]): Promise<void> {
		try {
			return this.func[cmd]?.(...args) ?? Promise.reject("command not found")
		}
		catch (err) {
			return Promise.reject(err)
		}
	}
}
