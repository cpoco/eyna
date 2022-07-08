export function SleepPromise(ms: number): Promise<void> {
	return new Promise((resolve, _reject) => {
		setTimeout(() => {
			resolve()
		}, ms)
	})
}
