import { Location } from "./Location"

const data = [
	"home",

	"filesystem\0c:/",
	"filesystem\0c:/aa",
	"filesystem\0c:/aa/bb",

	"filesystem\0/",
	"filesystem\0/aa",
	"filesystem\0/aa/bb",
	"filesystem\0/aa/bb/cc",

	"archive\0c:/aa/xxx.zip\0",
	"archive\0c:/aa/xxx.zip\0AA",
	"archive\0c:/aa/xxx.zip\0AA/BB",
	"archive\0c:/aa/xxx.zip\0AA/BB/CC",

	"archive\0/aa/xxx.zip\0",
	"archive\0/aa/xxx.zip\0AA",
	"archive\0/aa/xxx.zip\0AA/BB",
	"archive\0/aa/xxx.zip\0AA/BB/CC",
]

for (const d of data) {
	console.log("----")
	console.log(d.split("\0"))

	const lc = Location.parse(d)
	console.log(lc)
	console.log(Location.updir(lc))
}

