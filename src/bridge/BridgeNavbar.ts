export namespace Navbar {
	// renderer -> browser
	export namespace Title {
		export const CH = "navbar-title"
		export type Send = {
			ch: typeof CH
			args: Args
		}
		export type Args = [
			number,
			Data,
		]
		export type Data = string
	}
}
