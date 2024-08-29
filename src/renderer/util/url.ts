export function fileUrl(path: string): string {
	return `file://${
		path
			.replace(/%/g, "%25")
			.replace(/#/g, "%23")
			.replace(/\?/g, "%3F")
	}`
}
