export namespace Navbar {
	// renderer -> browser
	export namespace Title {
		export const CH = "navbar-title"
		export type Send = {
			ch: typeof CH
			args: [
				number,
				Data,
			]
		}
		export type Data = string
	}
}
