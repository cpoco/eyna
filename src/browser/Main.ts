import { Command } from "@/browser/core/Command"
import { Path } from "@/browser/core/Path"
import { Storage } from "@/browser/core/Storage"
import root from "@/browser/Root"

console.log(`\u001b[34m[versions]\u001b[0m`, process.versions)

Storage.manager.load(Path.data("conf.json"))
Command.manager.load(Path.app("config", "key.json"))
root.create(Path.app("app", "index.html"))
