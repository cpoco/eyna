import * as timers from "node:timers/promises"

import * as electron from "electron"

import * as Native from "@eyna/native/ts/browser"
import * as util from "@eyna/util"

const schema = "eyna"

export class Protocol {
	static register() {
		electron.protocol.registerSchemesAsPrivileged([{ scheme: schema }])
	}

	static handle() {
		electron.protocol.handle(schema, async (req: Request): Promise<Response> => {
			const { pathname } = new URL(req.url)
			const abst = decodeURIComponent(pathname.split("/")[1] ?? "")

			if (abst == "") {
				return new Response(null, { status: 400 })
			}

			const deferred = new util.DeferredPromise<Response>()
			queue.push({ abst: abst, deferred: deferred })
			return deferred.promise
		})

		worker()
	}
}

type task = {
	abst: string
	deferred: util.DeferredPromise<Response>
}

const queue: task[] = []

async function worker(): Promise<void> {
	while (true) {
		if (queue.length == 0) {
			await timers.setTimeout(10)
			continue
		}
		const front = queue.shift()!
		try {
			const icon = await Native.getIcon(front.abst)
			if (front.deferred.resolve) {
				front.deferred.resolve(
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
		}
		catch (err) {
			if (front.deferred.reject) {
				front.deferred.reject(err)
			}
		}
	}
}
