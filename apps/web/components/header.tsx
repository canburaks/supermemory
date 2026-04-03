"use client"

import { Logo } from "@ui/assets/Logo"
import { useAuth } from "@lib/auth-context"
import {
	LayoutGridIcon,
	Plus,
	SearchIcon,
	Settings,
	Home,
	Code2,
	Sun,
	ExternalLink,
	MenuIcon,
	MessageCircleIcon,
} from "lucide-react"
import { Button } from "@ui/components/button"
import { cn } from "@lib/utils"
import { dmSansClassName } from "@/lib/fonts"
import { Tabs, TabsList, TabsTrigger } from "@ui/components/tabs"
import { GraphIcon, IntegrationsIcon } from "@/components/integration-icons"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@ui/components/dropdown-menu"
import { useProject } from "@/stores"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { SpaceSelector } from "./space-selector"
import { useIsMobile } from "@hooks/use-mobile"
import { useLocalStorageUsername } from "@hooks/use-local-storage-username"
import { UserProfileMenu } from "@/components/user-profile-menu"
import { FeedbackModal } from "./feedback-modal"
import { useViewMode, type ViewMode } from "@/lib/view-mode-context"
import { useQueryState } from "nuqs"
import { feedbackParam } from "@/lib/search-params"

interface HeaderProps {
	onAddMemory?: () => void
	onOpenChat?: () => void
	onOpenSearch?: () => void
}

export function Header({ onAddMemory, onOpenChat, onOpenSearch }: HeaderProps) {
	const { user, isRestoring } = useAuth()
	const { selectedProjects, setSelectedProjects } = useProject()
	const router = useRouter()
	const isMobile = useIsMobile()
	const [feedbackOpen, setFeedbackOpen] = useQueryState(
		"feedback",
		feedbackParam,
	)
	const { viewMode, setViewMode } = useViewMode()

	const handleFeedback = () => setFeedbackOpen(true)

	const localStorageUsername = useLocalStorageUsername()
	const displayName =
		user?.displayUsername ||
		(isRestoring ? localStorageUsername : "") ||
		user?.name ||
		""
	const userName = displayName ? `${displayName.split(" ")[0]}'s` : "My"
	return (
		<div className="flex p-3 md:p-4 justify-between items-center gap-2">
			<div className="flex items-center justify-center gap-2 md:gap-4 z-10! min-w-0">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<button
							type="button"
							className="flex items-center rounded-lg px-2 py-1.5 -ml-2 cursor-pointer hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 transition-colors shrink-0"
						>
							<Logo className="h-7" />
							{!isMobile && userName && (
								<div className="flex flex-col items-start justify-center ml-2">
									<p className="text-[#8B8B8B] text-[11px] leading-tight">
										{userName}
									</p>
									<p className="text-white font-bold text-xl leading-none -mt-1">
										supermemory
									</p>
								</div>
							)}
						</button>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align="start"
						className={cn(
							"min-w-[200px] p-1.5 rounded-xl border border-[#2E3033] shadow-[0px_1.5px_20px_0px_rgba(0,0,0,0.65)]",
							dmSansClassName(),
						)}
						style={{
							background: "linear-gradient(180deg, #0A0E14 0%, #05070A 100%)",
						}}
					>
						<DropdownMenuItem
							asChild
							className="px-3 py-2.5 rounded-md hover:bg-[#293952]/40 cursor-pointer text-white text-sm font-medium gap-2"
						>
							<Link href="/">
								<Home className="h-4 w-4 text-[#737373]" />
								Home
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem
							asChild
							className="px-3 py-2.5 rounded-md hover:bg-[#293952]/40 cursor-pointer text-white text-sm font-medium gap-2"
						>
							<a
								href="https://console.supermemory.ai"
								target="_blank"
								rel="noreferrer"
							>
								<Code2 className="h-4 w-4 text-[#737373]" />
								Developer console
							</a>
						</DropdownMenuItem>
						<DropdownMenuItem
							asChild
							className="px-3 py-2.5 rounded-md hover:bg-[#293952]/40 cursor-pointer text-white text-sm font-medium gap-2"
						>
							<a href="https://supermemory.ai" target="_blank" rel="noreferrer">
								<ExternalLink className="h-4 w-4 text-[#737373]" />
								supermemory.ai
							</a>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
				<div className="self-stretch w-px bg-[#FFFFFF33] hidden md:block" />
				{!isMobile && (
					<SpaceSelector
						selectedProjects={selectedProjects}
						onValueChange={setSelectedProjects}
						showChevron
						enableDelete
					/>
				)}
			</div>
			{!isMobile && (
				<Tabs
					value={viewMode === "list" ? "grid" : viewMode}
					onValueChange={(v) =>
						setViewMode(v === "grid" ? "list" : (v as ViewMode))
					}
				>
					<TabsList className="rounded-full border border-[#161F2C] h-11! z-10!">
						<TabsTrigger
							value="grid"
							className={cn(
								"rounded-full data-[state=active]:bg-[#00173C]! dark:data-[state=active]:border-[#2261CA33]! px-4 py-4 cursor-pointer",
								dmSansClassName(),
							)}
						>
							<LayoutGridIcon className="size-4" />
							Grid
						</TabsTrigger>
						<TabsTrigger
							value="graph"
							className={cn(
								"rounded-full dark:data-[state=active]:bg-[#00173C]! dark:data-[state=active]:border-[#2261CA33]! px-4 py-4 cursor-pointer",
								dmSansClassName(),
							)}
						>
							<GraphIcon className="size-4" />
							Graph
						</TabsTrigger>
						<TabsTrigger
							value="integrations"
							className={cn(
								"rounded-full dark:data-[state=active]:bg-[#00173C]! dark:data-[state=active]:border-[#2261CA33]! px-4 py-4 cursor-pointer",
								dmSansClassName(),
							)}
						>
							<IntegrationsIcon className="size-4" />
							Integrations
						</TabsTrigger>
					</TabsList>
				</Tabs>
			)}
			<div className="flex items-center gap-2 z-10!">
				{isMobile ? (
					<>
						<SpaceSelector
							selectedProjects={selectedProjects}
							onValueChange={setSelectedProjects}
							showChevron
							enableDelete
							compact
						/>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="headers"
									className="rounded-full text-base gap-2 h-10!"
								>
									<MenuIcon className="size-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								align="end"
								className={cn(
									"min-w-[200px] p-1.5 rounded-xl border border-[#2E3033] shadow-[0px_1.5px_20px_0px_rgba(0,0,0,0.65)]",
									dmSansClassName(),
								)}
								style={{
									background:
										"linear-gradient(180deg, #0A0E14 0%, #05070A 100%)",
								}}
							>
								<DropdownMenuItem
									onClick={onAddMemory}
									className="px-3 py-2.5 rounded-md hover:bg-[#293952]/40 cursor-pointer text-white text-sm font-medium gap-2"
								>
									<Plus className="h-4 w-4 text-[#737373]" />
									Add memory
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => setViewMode("integrations")}
									className="px-3 py-2.5 rounded-md hover:bg-[#293952]/40 cursor-pointer text-white text-sm font-medium gap-2"
								>
									<Sun className="h-4 w-4 text-[#737373]" />
									Integrations
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={onOpenChat}
									className="px-3 py-2.5 rounded-md hover:bg-[#293952]/40 cursor-pointer text-white text-sm font-medium gap-2"
								>
									<MessageCircleIcon className="h-4 w-4 text-[#737373]" />
									Chat with Nova
								</DropdownMenuItem>
								<DropdownMenuSeparator className="bg-[#2E3033]" />
								<DropdownMenuItem
									onClick={handleFeedback}
									className="px-3 py-2.5 rounded-md hover:bg-[#293952]/40 cursor-pointer text-white text-sm font-medium gap-2"
								>
									<MessageCircleIcon className="h-4 w-4 text-[#737373]" />
									Feedback
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => router.push("/settings")}
									className="px-3 py-2.5 rounded-md hover:bg-[#293952]/40 cursor-pointer text-white text-sm font-medium gap-2"
								>
									<Settings className="h-4 w-4 text-[#737373]" />
									Settings
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</>
				) : (
					<>
						<Button
							variant="headers"
							className="rounded-full text-base gap-2 h-10!"
							onClick={onAddMemory}
						>
							<div className="flex items-center gap-2">
								<Plus className="size-4" />
								Add memory
							</div>
							<span
								className={cn(
									"bg-[#21212180] border border-[#73737333] text-[#737373] rounded-sm size-4 text-[10px] flex items-center justify-center",
									dmSansClassName(),
								)}
							>
								C
							</span>
						</Button>
						<Button
							variant="headers"
							className="rounded-full text-base gap-2 h-10!"
							onClick={onOpenSearch}
						>
							<SearchIcon className="size-4" />
							<span className="bg-[#21212180] border border-[#73737333] text-[#737373] rounded-sm text-[10px] flex items-center justify-center gap-0.5 px-1">
								<svg
									className="size-[7.5px]"
									viewBox="0 0 9 9"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<title>Command Key</title>
									<path
										d="M6.66663 0.416626C6.33511 0.416626 6.01716 0.548322 5.78274 0.782743C5.54832 1.01716 5.41663 1.33511 5.41663 1.66663V6.66663C5.41663 6.99815 5.54832 7.31609 5.78274 7.55051C6.01716 7.78493 6.33511 7.91663 6.66663 7.91663C6.99815 7.91663 7.31609 7.78493 7.55051 7.55051C7.78493 7.31609 7.91663 6.99815 7.91663 6.66663C7.91663 6.33511 7.78493 6.01716 7.55051 5.78274C7.31609 5.54832 6.99815 5.41663 6.66663 5.41663H1.66663C1.33511 5.41663 1.01716 5.54832 0.782743 5.78274C0.548322 6.01716 0.416626 6.33511 0.416626 6.66663C0.416626 6.99815 0.548322 7.31609 0.782743 7.55051C1.01716 7.78493 1.33511 7.91663 1.66663 7.91663C1.99815 7.91663 2.31609 7.78493 2.55051 7.55051C2.78493 7.31609 2.91663 6.99815 2.91663 6.66663V1.66663C2.91663 1.33511 2.78493 1.01716 2.55051 0.782743C2.31609 0.548322 1.99815 0.416626 1.66663 0.416626C1.33511 0.416626 1.01716 0.548322 0.782743 0.782743C0.548322 1.01716 0.416626 1.33511 0.416626 1.66663C0.416626 1.99815 0.548322 2.31609 0.782743 2.55051C1.01716 2.78493 1.33511 2.91663 1.66663 2.91663H6.66663C6.99815 2.91663 7.31609 2.78493 7.55051 2.55051C7.78493 2.31609 7.91663 1.99815 7.91663 1.66663C7.91663 1.33511 7.78493 1.01716 7.55051 0.782743C7.31609 0.548322 6.99815 0.416626 6.66663 0.416626Z"
										stroke="#737373"
										strokeWidth="0.833333"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
								<span className={cn(dmSansClassName())}>K</span>
							</span>
						</Button>
						<Button
							variant="headers"
							className="rounded-full text-base gap-2 h-10!"
							onClick={handleFeedback}
						>
							<div className="flex items-center gap-2">
								<MessageCircleIcon className="size-4" />
								Feedback
							</div>
						</Button>
					</>
				)}
				<UserProfileMenu />
			</div>
			<FeedbackModal
				isOpen={feedbackOpen}
				onClose={() => setFeedbackOpen(false)}
			/>
		</div>
	)
}
