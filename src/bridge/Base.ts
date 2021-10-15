export namespace Base {
	export type Send = {
		ch: string
		args: Args
	}
	export type Args = [
		number,
		Data,
	]
	export type Data = {}
}
