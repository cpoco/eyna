import * as electron from "electron"
import * as timers from "node:timers/promises"

import * as Native from "@eyna/native/lib/browser"
import * as Util from "@eyna/util"

const schema = "eyna"

export class Protocol {
	static register() {
		electron.protocol.registerSchemesAsPrivileged([
			{
				scheme: schema,
				privileges: {
					supportFetchAPI: true,
				},
			},
		])
	}

	static handle() {
		electron.protocol.handle(schema, async (req: Request): Promise<Response> => {
			const url = new URL(req.url)

			if (url.host === "icon-path" || url.host === "icon-type") {
				return IconWorker.push(url)
			}
			else if (url.host === "blob") {
				return blob(url)
			}
			else if (url.host === "metrics") {
				return metrics()
			}
			else if (url.host === "versions") {
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

	static async push(url: URL): Promise<Response> {
		const path = url.pathname.split("/")

		if (!isTuple2(path)) {
			return new Response(null, { status: 400 })
		}
		if (url.host !== "icon-path" && url.host !== "icon-type") {
			return new Response(null, { status: 400 })
		}

		const deferred = new Util.DeferredPromise<Response>()
		this.queue.push({
			type: url.host,
			data: decodeURIComponent(path[1]),
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

const blob = (url: URL): Response => {
	const path = url.pathname.split("/")

	if (!isTuple4(path)) {
		return new Response(null, { status: 400 })
	}
	if (path[1] !== "arch") {
		return new Response(null, { status: 400 })
	}

	const reader = Native.getArchiveEntry(
		decodeURIComponent(path[2]),
		decodeURIComponent(path[3]),
	)
	return new Response(reader as unknown as BodyInit, {
		headers: {
			"content-type": "application/octet-stream",
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
