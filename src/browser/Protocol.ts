import * as electron from "electron"

import * as Native from "@eyna/native/ts/browser"
import * as Util from "@eyna/util"

const schema = "eyna"

export class Protocol {
	static register() {
		electron.protocol.registerSchemesAsPrivileged([{ scheme: schema }])
	}

	static handle() {
		const requestMax = 2
		let requestCount = 0

		electron.protocol.handle(schema, async (req: Request): Promise<Response> => {
			let u = new URL(req.url)
			let p = u.searchParams.get("p") ?? ""

			while (requestMax <= requestCount) {
				await Util.SleepPromise(0)
			}

			console.log(`\u001b[33m[icon]\u001b[0m`, { u: u.href, p: p })

			requestCount++
			return Native.getIcon(p)
				.then((icon: Buffer) => {
					return new Response(
						icon,
						{
							headers: {
								"content-type": "image/png",
								"cache-control": "no-store",
							},
						},
					)
				})
				.finally(() => {
					requestCount--
				})
		})
	}
}
