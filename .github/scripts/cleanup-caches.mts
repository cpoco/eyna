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

console.log(`Deleting caches created before: ${threshold.toISOString()}`)

const res = await fetch(
	`https://api.github.com/repos/${repo}/actions/caches?per_page=100`,
	{ headers },
)
if (!res.ok) {
	throw new Error(`Failed to list caches: ${res.status} ${await res.text()}`)
}

const { actions_caches } = (await res.json()) as {
	actions_caches: { id: number; created_at: string; key: string }[]
}

const targets = actions_caches.filter(
	(c) => {
		return new Date(c.created_at) < threshold
	}
)

if (targets.length === 0) {
	console.log("No caches to delete.")
}
else {
	for (const cache of targets) {
		console.log(`Deleting cache ${cache.id} (key: ${cache.key}, created: ${cache.created_at})`)
		const del = await fetch(
			`https://api.github.com/repos/${repo}/actions/caches/${cache.id}`,
			{ method: "DELETE", headers },
		)
		if (!del.ok) {
			throw new Error(`Failed to delete cache ${cache.id}: ${del.status}`)
		}
	}
	console.log(`Deleted ${targets.length} cache(s).`)
}
