import { Command } from "@/browser/core/Command"
import { Path } from "@/browser/core/Path"
import { Storage } from "@/browser/core/Storage"
import root from "@/browser/Root"

Storage.manager.load(`${Path.userPath()}/conf.json`)
Command.manager.load(`${Path.appPath()}/config/key.json`)
root.create(`file://${Path.appPath()}/app/index.html`)
