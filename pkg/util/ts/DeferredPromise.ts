export class DeferredPromise<T> {
	public promise: Promise<T>
	public resolve: ((value: T | PromiseLike<T>) => void) | null = null
	public reject: ((reason?: any) => void) | null = null

	constructor() {
		this.promise = new Promise<T>((resolve, reject) => {
			this.resolve = resolve
			this.reject = reject
		})
	}
}
