/**
 * Memories proxy for supermemory-server.
 *
 * Wraps the local supermemory-server binary and injects an expandable
 * "Memories" section into the landing page before the footer.
 *
 * Usage:
 *   1. Stop the running server on port 6767
 *   2. Start the binary on port 6768: PORT=6768 supermemory-server
 *   3. Run this proxy: bun run scripts/memories-proxy.ts
 *
 * The proxy listens on 6767 and forwards everything to the upstream on 6768,
 * except the root page which gets the memories list injected.
 */

const UPSTREAM_PORT = parseInt(process.env.UPSTREAM_PORT ?? "6768", 10)
const LISTEN_PORT = parseInt(process.env.PORT ?? "6767", 10)

const UPSTREAM = `http://localhost:${UPSTREAM_PORT}`

interface MemoryEntry {
	id: string
	memory: string
	createdAt: string
	updatedAt: string
	spaceId?: string
	isStatic?: boolean
	isInference?: boolean
	isForgotten?: boolean
	forgetAfter?: string
}

interface SearchResult {
	results: MemoryEntry[]
	total: number
}

async function fetchMemories(apiKey: string): Promise<MemoryEntry[]> {
	try {
		const res = await fetch(`${UPSTREAM}/v3/search`, {
			method: "POST",
			headers: {
				"Authorization": `Bearer ${apiKey}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ q: "*", searchMode: "memories", limit: 100 }),
		})
		if (!res.ok) return []
		const data = (await res.json()) as SearchResult
		return data.results ?? []
	} catch {
		return []
	}
}

function extractApiKey(html: string): string | null {
	const m = html.match(/sm_[A-Za-z0-9_-]+/)
	return m ? m[0] : null
}

function formatDate(d: string): string {
	try {
		return new Date(d).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		})
	} catch {
		return d
	}
}

function buildMemoriesHtml(memories: MemoryEntry[]): string {
	if (memories.length === 0) {
		return `
<div class="memories-section">
  <h2 class="section-title">Memories</h2>
  <p class="memories-empty">No memories yet. Add content to see it here.</p>
</div>`
	}

	const items = memories
		.filter((m) => !m.isForgotten)
		.map(
			(m, i) => `
    <details class="memory-item" ${i < 5 ? "open" : ""}>
      <summary class="memory-summary">
        <span class="memory-text">${escapeHtml(m.memory.length > 120 ? m.memory.slice(0, 120) + "…" : m.memory)}</span>
        <span class="memory-meta">${formatDate(m.createdAt)}${m.isStatic ? " · static" : ""}${m.isInference ? " · inferred" : ""}</span>
      </summary>
      <div class="memory-detail">${escapeHtml(m.memory)}</div>
    </details>`,
		)
		.join("\n")

	return `
<div class="memories-section">
  <h2 class="section-title">Memories <span class="memories-count">(${memories.length})</span></h2>
  <div class="memories-list">
    ${items}
  </div>
</div>`
}

function escapeHtml(s: string): string {
	return s
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
}

const MEMORIES_CSS = `
/* ── Memories section ── */
.memories-section {
  margin-top: 56px;
}
.memories-section .section-title {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 600;
  letter-spacing: -0.02em;
  margin: 0 0 20px;
  color: var(--text-primary);
}
.memories-count {
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 400;
  color: var(--text-muted);
  margin-left: 6px;
}
.memories-empty {
  color: var(--text-muted);
  font-size: 14px;
  margin: 0;
}
.memories-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.memory-item {
  background: var(--bg-elevated);
  border: 1px solid var(--border-muted);
  border-radius: 10px;
  overflow: hidden;
  transition: border-color 0.15s;
}
.memory-item:hover {
  border-color: var(--border);
}
.memory-item[open] {
  border-color: var(--border);
}
.memory-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 18px;
  cursor: pointer;
  list-style: none;
  font-size: 14px;
  color: var(--text-primary);
}
.memory-summary::-webkit-details-marker {
  display: none;
}
.memory-summary::before {
  content: "+";
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 5px;
  background: var(--bg-muted);
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  flex-shrink: 0;
  transition: transform 0.15s, background 0.15s;
}
.memory-item[open] .memory-summary::before {
  content: "−";
  background: rgba(17,125,255,0.10);
  color: var(--accent);
}
.memory-text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.memory-meta {
  font-size: 11px;
  color: var(--text-muted);
  white-space: nowrap;
  flex-shrink: 0;
}
.memory-detail {
  padding: 0 18px 16px 52px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-secondary);
  white-space: pre-wrap;
  word-break: break-word;
}
`

function injectMemoriesSection(html: string, memories: MemoryEntry[]): string {
	const memoriesHtml = buildMemoriesHtml(memories)

	// Inject CSS before </style> (the last </style> is in the embedded <style> block)
	const styleInsertPoint = html.lastIndexOf("</style>")
	if (styleInsertPoint !== -1) {
		html = html.slice(0, styleInsertPoint) + MEMORIES_CSS + html.slice(styleInsertPoint)
	}

	// Inject memories HTML before </footer>
	const footerIdx = html.indexOf("</footer>")
	if (footerIdx !== -1) {
		html = html.slice(0, footerIdx) + memoriesHtml + "\n" + html.slice(footerIdx)
	}

	return html
}

// ── Proxy server ──

const server = Bun.serve({
	port: LISTEN_PORT,
	async fetch(req) {
		const url = new URL(req.url)
		const target = `${UPSTREAM}${url.pathname}${url.search}`

		// Intercept root page
		if (url.pathname === "/" || url.pathname === "") {
			try {
				const upstreamRes = await fetch(target, {
					method: req.method,
					headers: req.headers,
				})
				let html = await upstreamRes.text()
				const apiKey = extractApiKey(html)

				if (apiKey) {
					const memories = await fetchMemories(apiKey)
					html = injectMemoriesSection(html, memories)
				}

				return new Response(html, {
					headers: { "Content-Type": "text/html; charset=utf-8" },
				})
			} catch (err) {
				return new Response("Proxy error — is supermemory-server running on port " + UPSTREAM_PORT + "?", { status: 502 })
			}
		}

		// Proxy everything else
		try {
			const upstreamRes = await fetch(target, {
				method: req.method,
				headers: req.headers,
				body: req.body,
				// @ts-expect-error duplex is valid for fetch but not in Bun types
				duplex: "half",
			})
			return upstreamRes
		} catch {
			return new Response("Proxy error", { status: 502 })
		}
	},
})

console.log(`\n  memories proxy  →  http://localhost:${LISTEN_PORT}`)
console.log(`  upstream         →  ${UPSTREAM}\n`)
