const token = process.env.GITHUB_TOKEN
const repo = process.env.GITHUB_REPOSITORY

if (!token) { throw new Error("GITHUB_TOKEN is not set") }
if (!repo) { throw new Error("GITHUB_REPOSITORY is not set") }

const headers = {
	Authorization: `Bearer ${token}`,
	Accept: "application/vnd.github+json",
	"X-GitHub-Api-Version": "2022-11-28",
}

const threshold = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
const activeStatuses = new Set(["in_progress", "queued", "waiting"])

console.log(`Deleting runs created before: ${threshold.toISOString()}`)

const res = await fetch(
	`https://api.github.com/repos/${repo}/actions/runs?per_page=100`,
	{ headers },
)
if (!res.ok) {
	throw new Error(`Failed to list runs: ${res.status} ${await res.text()}`)
}

const { workflow_runs } = (await res.json()) as {
	workflow_runs: { id: number; created_at: string; status: string }[]
}

const targets = workflow_runs.filter(
	(r) => {
		return new Date(r.created_at) < threshold && !activeStatuses.has(r.status)
	}
)

if (targets.length === 0) {
	console.log("No runs to delete.")
}
else {
	for (const run of targets) {
		console.log(`Deleting run ${run.id} (created: ${run.created_at})`)
		const del = await fetch(
			`https://api.github.com/repos/${repo}/actions/runs/${run.id}`,
			{ method: "DELETE", headers },
		)
		if (!del.ok) {
			throw new Error(`Failed to delete run ${run.id}: ${del.status}`)
		}
	}
	console.log(`Deleted ${targets.length} run(s).`)
}
