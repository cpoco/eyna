import root from '@browser/Root'
import { Path } from '@browser/core/Path'
import { Command } from '@browser/core/Command'
import { Storage } from '@browser/core/Storage'

Storage.manager.load(`${Path.userPath()}/conf.json`)
Command.manager.load(`${Path.appPath()}/config/key.json`)
root.create(`file://${Path.appPath()}/app/index.html`)
