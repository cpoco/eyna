export class DeferredPromise<T> {
	public promise: Promise<T>
	public resolve: Function | null = null
	public reject: Function | null = null

	constructor() {
		this.promise = new Promise<T>((_resolve, _reject) => {
			this.resolve = _resolve
			this.reject = _reject
		})
	}
}
