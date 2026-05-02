"use client"

import { useState, useEffect, useCallback } from "react"
import { $fetch } from "@lib/api"
import type { SearchResult } from "@repo/lib/api"

const CACHE_KEY = "sm_profession_v1"
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000

export type Profession =
	| "developer"
	| "finance"
	| "research"
	| "design"
	| "legal"
	| "marketing"
	| "medical"
	| "default"

export interface PersonalizedCopy {
	saveLink: string
	writeNote: string
	chatPlaceholder: string
}

const COPY: Record<Profession, PersonalizedCopy> = {
	developer: {
		saveLink: "Save a repo",
		writeNote: "Write dev notes",
		chatPlaceholder: "Ask about your code, docs, or notes…",
	},
	finance: {
		saveLink: "Save an article",
		writeNote: "Log a thesis",
		chatPlaceholder: "Ask about your research or portfolio…",
	},
	research: {
		saveLink: "Save a paper",
		writeNote: "Write notes",
		chatPlaceholder: "Ask about your reading or research…",
	},
	design: {
		saveLink: "Save inspiration",
		writeNote: "Write a brief",
		chatPlaceholder: "What are you working on today?",
	},
	legal: {
		saveLink: "Save a document",
		writeNote: "Write a memo",
		chatPlaceholder: "Ask about your cases or contracts…",
	},
	marketing: {
		saveLink: "Save a resource",
		writeNote: "Write campaign notes",
		chatPlaceholder: "Ask about your campaigns or research…",
	},
	medical: {
		saveLink: "Save a study",
		writeNote: "Write clinical notes",
		chatPlaceholder: "Ask about your research or cases…",
	},
	default: {
		saveLink: "Save link",
		writeNote: "Write note",
		chatPlaceholder: "Ask your supermemory…",
	},
}

const KEYWORDS: Record<Exclude<Profession, "default">, string[]> = {
	developer: [
		"software",
		"engineer",
		"developer",
		"programming",
		"code",
		"github",
		"typescript",
		"javascript",
		"python",
		"backend",
		"frontend",
		"api",
		"repository",
		"startup",
		"swe",
		"tech",
		"devops",
		"cloud",
	],
	finance: [
		"finance",
		"investment",
		"portfolio",
		"trading",
		"stock",
		"fund",
		"equity",
		"crypto",
		"banking",
		"analyst",
		"fintech",
		"hedge",
		"venture",
		"capital",
		"asset",
		"valuation",
		"economics",
	],
	research: [
		"research",
		"academia",
		"phd",
		"paper",
		"journal",
		"study",
		"scholar",
		"university",
		"professor",
		"scientist",
		"thesis",
		"experiment",
		"hypothesis",
		"data analysis",
		"publication",
	],
	design: [
		"design",
		"ux",
		"ui",
		"figma",
		"creative",
		"visual",
		"brand",
		"illustrator",
		"adobe",
		"typography",
		"wireframe",
		"prototype",
		"product design",
		"graphic",
		"art director",
	],
	legal: [
		"lawyer",
		"attorney",
		"legal",
		"law",
		"contract",
		"compliance",
		"litigation",
		"counsel",
		"paralegal",
		"court",
		"regulatory",
		"intellectual property",
		"patent",
		"trademark",
	],
	marketing: [
		"marketing",
		"growth",
		"seo",
		"content",
		"campaign",
		"brand",
		"advertising",
		"social media",
		"pr",
		"communications",
		"copywriting",
		"conversion",
		"analytics",
		"inbound",
	],
	medical: [
		"doctor",
		"physician",
		"medical",
		"healthcare",
		"clinical",
		"hospital",
		"nursing",
		"surgery",
		"patient",
		"medicine",
		"diagnosis",
		"treatment",
		"pharmacology",
		"dentist",
	],
}

function classifyProfession(results: SearchResult[]): Profession {
	const text = results
		.flatMap((r) => [
			r.title ?? "",
			r.summary ?? "",
			...(r.chunks?.slice(0, 2).map((c) => c.content) ?? []),
		])
		.join(" ")
		.toLowerCase()

	const scores: Partial<Record<Profession, number>> = {}
	for (const [prof, words] of Object.entries(KEYWORDS)) {
		scores[prof as Profession] = words.filter((w) => text.includes(w)).length
	}

	const best = (Object.entries(scores) as [Profession, number][]).sort(
		(a, b) => b[1] - a[1],
	)[0]
	return best && best[1] > 0 ? best[0] : "default"
}

let inflightPromise: Promise<void> | null = null

export function usePersonalization(): {
	copy: PersonalizedCopy
	profession: Profession
	setProfession: (p: Profession) => void
} {
	const [copy, setCopy] = useState<PersonalizedCopy>(COPY.default)
	const [profession, setProfessionState] = useState<Profession>("default")

	const setProfession = useCallback((p: Profession) => {
		try {
			localStorage.setItem(
				CACHE_KEY,
				JSON.stringify({ profession: p, ts: Date.now() }),
			)
		} catch {}
		setCopy(COPY[p])
		setProfessionState(p)
	}, [])

	useEffect(() => {
		try {
			const raw = localStorage.getItem(CACHE_KEY)
			if (raw) {
				const { profession: cached, ts } = JSON.parse(raw) as {
					profession: Profession
					ts: number
				}
				if (Date.now() - ts < CACHE_TTL_MS && COPY[cached]) {
					setCopy(COPY[cached])
					setProfessionState(cached)
					return
				}
			}
		} catch {}

		if (inflightPromise) {
			inflightPromise.then(() => {
				try {
					const raw = localStorage.getItem(CACHE_KEY)
					if (raw) {
						const { profession: cached } = JSON.parse(raw) as {
							profession: Profession
						}
						if (COPY[cached]) {
							setCopy(COPY[cached])
							setProfessionState(cached)
						}
					}
				} catch {}
			})
			return
		}

		inflightPromise = $fetch("@post/search", {
			body: {
				q: "career profession field industry background work role",
				limit: 8,
			},
		})
			.then((res) => {
				const results = res.data?.results
				if (!results?.length) return
				const detected = classifyProfession(results)
				try {
					localStorage.setItem(
						CACHE_KEY,
						JSON.stringify({ profession: detected, ts: Date.now() }),
					)
				} catch {}
				setCopy(COPY[detected])
				setProfessionState(detected)
			})
			.catch(() => {})
			.finally(() => {
				inflightPromise = null
			})
	}, [])

	return { copy, profession, setProfession }
}

export function clearPersonalizationCache() {
	try {
		localStorage.removeItem(CACHE_KEY)
	} catch {}
}
