export namespace Root {
	// renderer -> browser
	export namespace Clipboard {
		export const CH = "root-clipboard"
		export type Send = {
			ch: "root-clipboard"
			args: Args
		}
		export type Args = [
			-1,
			Data,
		]
		export type Data = {
			command: "cut" | "copy" | "paste"
		}
	}
}
