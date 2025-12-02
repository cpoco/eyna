import { Path } from "@/browser/core/Path"
import root from "@/browser/Root"

console.log(`\u001b[34m[versions]\u001b[0m`, process.versions)

root.create(Path.app("app", "index.html"))
