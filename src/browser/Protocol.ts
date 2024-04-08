import * as electron from "electron"
import * as timers from "node:timers/promises"

import * as Native from "@eyna/native/ts/browser"
import * as util from "@eyna/util"

const schema = "eyna"

export class Protocol {
	static register() {
		electron.protocol.registerSchemesAsPrivileged([{ scheme: schema }])
	}

	static handle() {
		electron.protocol.handle(schema, async (req: Request): Promise<Response> => {
			return IconWorker.push(req)
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

	static async push(req: Request): Promise<Response> {
		const path = (new URL(req.url)).pathname.split("/")

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
