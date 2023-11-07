import * as electron from "electron"

import * as Native from "@eyna/native/ts/browser"

const schema = "eyna"

export class Protocol {
	static register() {
		electron.protocol.registerSchemesAsPrivileged([{ scheme: schema }])
	}

	static handle() {
		electron.protocol.handle(schema, async (req: Request): Promise<Response> => {
			let url = new URL(req.url)
			let p = url.searchParams.get("p") ?? ""

			console.log(`\u001b[33m[icon]\u001b[0m`, { url: req.url, p: p })

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
		})
	}
}
