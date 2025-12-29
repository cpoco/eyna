import * as electron from "electron"
import * as timers from "node:timers/promises"

import * as Native from "@eyna/native/lib/browser"
import * as Util from "@eyna/util"

const SCHEMA = "eyna"

const ICON_PATH = `${SCHEMA}://icon-path/`
const ICON_TYPE = `${SCHEMA}://icon-type/`
const BLOB = `${SCHEMA}://blob/`
const METRICS = `${SCHEMA}://metrics/`
const VERSIONS = `${SCHEMA}://versions/`

export class Protocol {
	static register() {
		electron.protocol.registerSchemesAsPrivileged([
			{
				scheme: SCHEMA,
				privileges: {
					supportFetchAPI: true,
				},
			},
		])
	}

	static handle() {
		electron.protocol.handle(SCHEMA, async (req: Request): Promise<Response> => {
			if (req.url.startsWith(ICON_PATH) || req.url.startsWith(ICON_TYPE)) {
				return IconWorker.push(req)
			}
			else if (req.url.startsWith(BLOB)) {
				return blob(req)
			}
			else if (req.url.startsWith(METRICS)) {
				return metrics()
			}
			else if (req.url.startsWith(VERSIONS)) {
				return versions()
			}
			return new Response(null, { status: 500 })
		})
		IconWorker.run()
	}
}

type Task = {
	type: "icon-path" | "icon-type"
	data: string
	deferred: Util.DeferredPromise<Response>
}

class IconWorker {
	private static queue: Task[] = []

	static async push(req: Request): Promise<Response> {
		const url = new URL(req.url)
		const parts = url.pathname.split("/")

		if (!isTuple2(parts)) {
			return new Response(null, { status: 400 })
		}
		if (url.host !== "icon-path" && url.host !== "icon-type") {
			return new Response(null, { status: 400 })
		}

		const deferred = new Util.DeferredPromise<Response>()
		this.queue.push({
			type: url.host,
			data: decodeURIComponent(parts[1]),
			deferred: deferred,
		})

		return deferred.promise
	}

	static async run(): Promise<void> {
		while (true) {
			if (this.queue.length === 0) {
				await timers.setTimeout(10)
				continue
			}

			const first = this.queue.shift()!

			try {
				if (first.type === "icon-path") {
					const icon = await Native.getIcon(first.data)
					first.deferred.resolve?.(
						new Response(
							icon as BodyInit,
							{
								headers: {
									"content-type": "image/png",
									"cache-control": "no-store",
								},
							},
						),
					)
				}
				else if (first.type === "icon-type") {
					const icon = await Native.getIconType(first.data)
					first.deferred.resolve?.(
						new Response(
							icon as BodyInit,
							{
								headers: {
									"content-type": "image/png",
									"cache-control": "no-store",
								},
							},
						),
					)
				}
			}
			catch (err) {
				first.deferred.reject?.(err)
			}
		}
	}
}

const blob = async (req: Request): Promise<Response> => {
	const url = new URL(req.url)
	const parts = url.pathname.split("/")

	if (!isTuple4(parts)) {
		return new Response(null, { status: 400 })
	}
	if (parts[1] !== "arch") {
		return new Response(null, { status: 400 })
	}

	const { size, reader } = await Native.getArchiveEntry(
		decodeURIComponent(parts[2]),
		decodeURIComponent(parts[3]),
	)
	return new Response(reader as unknown as BodyInit, {
		headers: {
			"content-type": "application/octet-stream",
			"content-length": size.toString(),
			"cache-control": "no-store",
		},
	})
}

const metrics = (): Response => {
	return new Response(
		JSON.stringify({ metrics: electron.app.getAppMetrics() }),
		{
			headers: {
				"content-type": "application/json",
				"cache-control": "no-store",
			},
		},
	)
}

const versions = (): Response => {
	return new Response(
		JSON.stringify({
			app: {
				version: electron.app.getVersion(),
				admin: Native.isElevated(),
			},
			system: {
				electron: process.versions.electron,
				node: process.versions.node,
				chrome: process.versions.chrome,
				v8: process.versions.v8,
			},
		}),
		{
			headers: {
				"content-type": "application/json",
				"cache-control": "no-store",
			},
		},
	)
}

const isTuple2 = <T>(ary: T[]): ary is [T, T] => {
	return ary.length === 2
}

const isTuple4 = <T>(ary: T[]): ary is [T, T, T, T] => {
	return ary.length === 4
}
