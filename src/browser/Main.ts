import { AppConfig } from "@/browser/conf/AppConfig"
import { KeyConfig } from "@/browser/conf/KeyConfig"
import { Path } from "@/browser/core/Path"
import root from "@/browser/Root"

console.log(`\u001b[34m[versions]\u001b[0m`, process.versions)

AppConfig.load(Path.data("app.json"))
KeyConfig.load(Path.app("config", "key.json"))
root.create(Path.app("app", "index.html"))
