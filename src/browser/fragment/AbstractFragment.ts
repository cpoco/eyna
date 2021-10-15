import * as _ from 'lodash-es'

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
			if (_.has(this.func, [cmd])) {
				return this.func[cmd](...args)
			}
			return Promise.resolve()
		}
		catch (err) {
			return Promise.reject(err)
		}
	}
}
