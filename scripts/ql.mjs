import fse from "fs-extra"
import child_process from "node:child_process"
import path from "node:path"
import url from "node:url"

const codeql = process.env["GITHUB_ACTIONS"] == "true"
	? path.join(process.env["CODEQL_DIST"], "codeql")
	: "codeql"

const __top = path.join(import.meta.dirname, "..")

const __db = path.join(__top, "codeql", "db")
const __out = path.join(__top, "codeql")

await fse.mkdirp(__db)

await new Promise((resolve) => {
	const cmd = [
		codeql,
		`database`,
		`create`,
		`--threads=0`,
		`--overwrite`,
		`--db-cluster`,
		`--language="cpp,javascript"`,
		`--command="npm run b"`,
		`--`,
		`"${__db}"`,
	].join(" ")

	console.log("\n----------")
	console.log(cmd)
	console.log("----------\n")

	const p = child_process.exec(cmd, { cwd: __top })
	p.stdout.pipe(process.stdout)
	p.stderr.pipe(process.stderr)
	p.on("close", code => {
		resolve(code)
	})
})

await new Promise((resolve) => {
	const cmd = [
		codeql,
		`database`,
		`analyze`,
		`--threads=0`,
		`--download`,
		`--format=sarif-latest`,
		`--output="${path.join(__out, "cpp.sarif")}"`,
		`--`,
		`"${path.join(__db, "cpp")}"`,
		`codeql/cpp-queries:codeql-suites/cpp-code-scanning.qls`,
		`codeql/cpp-queries:codeql-suites/cpp-lgtm-full.qls`,
		`codeql/cpp-queries:codeql-suites/cpp-lgtm.qls`,
		`codeql/cpp-queries:codeql-suites/cpp-security-and-quality.qls`,
		`codeql/cpp-queries:codeql-suites/cpp-security-experimental.qls`,
		`codeql/cpp-queries:codeql-suites/cpp-security-extended.qls`,
	].join(" ")

	console.log("\n----------")
	console.log(cmd)
	console.log("----------\n")

	const p = child_process.exec(cmd, { cwd: __top })
	p.stdout.pipe(process.stdout)
	p.stderr.pipe(process.stderr)
	p.on("close", code => {
		resolve(code)
	})
})

await new Promise((resolve) => {
	const cmd = [
		codeql,
		`database`,
		`analyze`,
		`--threads=0`,
		`--download`,
		`--format=sarif-latest`,
		`--output="${path.join(__out, "javascript.sarif")}"`,
		`--`,
		`"${path.join(__db, "javascript")}"`,
		`codeql/javascript-queries:codeql-suites/javascript-code-scanning.qls`,
		`codeql/javascript-queries:codeql-suites/javascript-lgtm-full.qls`,
		`codeql/javascript-queries:codeql-suites/javascript-lgtm.qls`,
		`codeql/javascript-queries:codeql-suites/javascript-security-and-quality.qls`,
		`codeql/javascript-queries:codeql-suites/javascript-security-experimental.qls`,
		`codeql/javascript-queries:codeql-suites/javascript-security-extended.qls`,
	].join(" ")

	console.log("\n----------")
	console.log(cmd)
	console.log("----------\n")

	const p = child_process.exec(cmd, { cwd: __top })
	p.stdout.pipe(process.stdout)
	p.stderr.pipe(process.stderr)
	p.on("close", code => {
		resolve(code)
	})
})
