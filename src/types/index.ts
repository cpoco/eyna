// esbuild loader: { ".png": "base64" }
declare module "*.png" {
	const base64: string
	export default base64
}
