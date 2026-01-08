import * as Native from "@eyna/native/lib/browser"

import * as Conf from "@/app/Conf"
import { AppConfig } from "@/browser/conf/AppConfig"
import { KeyConfig } from "@/browser/conf/KeyConfig"
import { SysConfig } from "@/browser/conf/SysConfig"
import { Path } from "@/browser/core/Path"
import root from "@/browser/Root"

console.log(`\u001b[34m[versions]\u001b[0m`, process.versions)

Native.setExte(Conf.MULTI_EXTE)

SysConfig.load(
	Path.app("config", "sys.json"),
	Path.data("sys.json"),
)
KeyConfig.load(
	Path.app("config", "key.json"),
	null,
)
AppConfig.load(
	null,
	Path.data("app.json"),
)
root.create(Path.app("app", "index.html"))
