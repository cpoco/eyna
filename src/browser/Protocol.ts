import * as electron from "electron"
import * as timers from "node:timers/promises"

import * as Native from "@eyna/native/ts/browser"
import * as util from "@eyna/util"

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

			if (url.host == "icon") {
				return IconWorker.push(url)
			}
			else if (url.host == "metrics") {
				return metrics()
			}
			else if (url.host == "versions") {
				return versions()
			}
			return new Response(null, { status: 500 })
		})
		IconWorker.run()
	}
}

type task = {
	abst: string
	deferred: util.DeferredPromise<Response>
}

class IconWorker {
	private static queue: task[] = []

	private static verify(ary: string[]): ary is [string, string] {
		return ary.length == 2
	}

	static async push(url: URL): Promise<Response> {
		const path = url.pathname.split("/")

		if (!this.verify(path)) {
			return new Response(null, { status: 400 })
		}

		const deferred = new util.DeferredPromise<Response>()
		this.queue.push({
			abst: decodeURIComponent(path[1]),
			deferred: deferred,
		})

		return deferred.promise
	}

	static async run(): Promise<void> {
		while (true) {
			if (this.queue.length == 0) {
				await timers.setTimeout(10)
				continue
			}

			const first = this.queue.shift()!

			try {
				const icon = await Native.getIcon(first.abst)
				first.deferred.resolve?.(
					new Response(
						icon,
						{
							headers: {
								"content-type": "image/png",
								"cache-control": "no-store",
							},
						},
					),
				)
			}
			catch (err) {
				first.deferred.reject?.(err)
			}
		}
	}
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

