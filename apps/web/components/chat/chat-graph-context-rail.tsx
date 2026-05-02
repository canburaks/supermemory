"use client"

import { useMemo } from "react"
import type { UIMessage } from "@ai-sdk/react"
import { MemoryGraph } from "@/components/memory-graph"
import { useProject } from "@/stores"
import { extractHighlightDocumentIdsFromMessages } from "@/lib/chat-highlight-documents"
import { cn } from "@lib/utils"
import { dmSansClassName } from "@/lib/fonts"

export function ChatGraphContextRail({
	messages,
	className,
}: {
	messages: UIMessage[]
	className?: string
}) {
	const { effectiveContainerTags } = useProject()
	const highlightIds = useMemo(
		() => extractHighlightDocumentIdsFromMessages(messages),
		[messages],
	)

	return (
		<div
			id="chat-graph-context-rail"
			className={cn(
				"relative flex min-h-0 min-w-0 flex-1 flex-col bg-black",
				dmSansClassName(),
				className,
			)}
		>
			<div className="pointer-events-none absolute top-3 left-4 z-20">
				<p className="text-xs font-medium text-white/70">Memory map</p>
				<p className="mt-0.5 max-w-[14rem] text-[10px] leading-snug text-white/35">
					{highlightIds.length > 0
						? `${highlightIds.length} memor${highlightIds.length === 1 ? "y" : "ies"} used by Nova`
						: "Memories used by Nova will be highlighted here"}
				</p>
			</div>
			<div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-r from-transparent to-black" />
			<div className="min-h-0 flex-1 pt-10">
				<MemoryGraph
					containerTags={effectiveContainerTags}
					variant="consumer"
					highlightDocumentIds={highlightIds}
					highlightsVisible={highlightIds.length > 0}
					maxNodes={160}
				/>
			</div>
		</div>
	)
}
