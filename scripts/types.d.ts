// @types/pug
declare module "pug" {
	export function renderFile(path: string): string
}

// @types/stylus
declare module "stylus" {
	interface Renderer {
		set(key: string, val: any): this
		render(callback: (err: Error, css: string) => void): void
	}
	function stylus(str: string): Renderer
	export = stylus
}
