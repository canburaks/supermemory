"use client"
import { Logo } from "@ui/assets/Logo"
import { UserProfileMenu } from "@/components/user-profile-menu"
import { useAuth } from "@lib/auth-context"
import { motion } from "motion/react"
import NovaOrb from "@/components/nova/nova-orb"
import { useState, useEffect, useRef } from "react"
import { cn } from "@lib/utils"
import { dmSansClassName } from "@/lib/fonts"
import Account from "@/components/settings/account"
import Integrations from "@/components/settings/integrations"
import ConnectionsMCP from "@/components/settings/connections-mcp"
import Support from "@/components/settings/support"
import { ErrorBoundary } from "@/components/error-boundary"
import { useRouter } from "next/navigation"
import { useIsMobile } from "@hooks/use-mobile"
import { useLocalStorageUsername } from "@hooks/use-local-storage-username"
import { analytics } from "@/lib/analytics"
import { Sun } from "lucide-react"

const TABS = ["account", "integrations", "connections", "support"] as const
type SettingsTab = (typeof TABS)[number]

type NavItem = {
	id: SettingsTab
	label: string
	description: string
	icon: React.ReactNode
}

const NAV_ITEMS: NavItem[] = [
	{
		id: "account",
		label: "Account & Billing",
		description: "Manage your profile, plan, usage and payments",
		icon: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				aria-hidden="true"
			>
				<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
				<circle cx="12" cy="7" r="4" />
			</svg>
		),
	},
	{
		id: "integrations",
		label: "Integrations",
		description: "Save, sync and search memories across tools",
		icon: <Sun className="size-5" />,
	},
	{
		id: "connections",
		label: "Connections & MCP",
		description: "Sync with Google Drive, Notion, OneDrive and MCP client",
		icon: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				aria-hidden="true"
			>
				<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
			</svg>
		),
	},
	{
		id: "support",
		label: "Support & Help",
		description: "Find answers or share feedback. We're here to help.",
		icon: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				aria-hidden="true"
			>
				<circle cx="12" cy="12" r="10" />
				<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
				<path d="M12 17h.01" />
			</svg>
		),
	},
]

function parseHashToTab(hash: string): SettingsTab {
	const cleaned = hash.replace("#", "").toLowerCase()
	return TABS.includes(cleaned as SettingsTab)
		? (cleaned as SettingsTab)
		: "account"
}

export function UserSupermemory({ name }: { name: string }) {
	return (
		<motion.div
			className="absolute inset-0 top-[-40px] flex items-center justify-center z-10"
			initial={{ opacity: 0, y: 0 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: 0 }}
			transition={{ duration: 1, ease: "easeOut" }}
		>
			<Logo className="h-7 text-white" />
			<div className="flex flex-col items-start justify-center ml-4 space-y-1">
				<p className="text-white text-[15px] font-medium leading-none">
					{name.split(" ")[0]}'s
				</p>
				<p className="text-white font-bold text-xl leading-none -mt-2">
					supermemory
				</p>
			</div>
		</motion.div>
	)
}

export default function SettingsPage() {
	const { user } = useAuth()
	const [activeTab, setActiveTab] = useState<SettingsTab>("account")
	const hasInitialized = useRef(false)
	const router = useRouter()
	const isMobile = useIsMobile()
	const localStorageUsername = useLocalStorageUsername()

	useEffect(() => {
		if (hasInitialized.current) return
		hasInitialized.current = true

		const hash = window.location.hash
		const tab = parseHashToTab(hash)
		setActiveTab(tab)
		analytics.settingsTabChanged({ tab })

		// If no hash or invalid hash, push #account
		if (!hash || !TABS.includes(hash.replace("#", "") as SettingsTab)) {
			window.history.pushState(null, "", "#account")
		}
	}, [])

	useEffect(() => {
		const handleHashChange = () => {
			const tab = parseHashToTab(window.location.hash)
			setActiveTab(tab)
			analytics.settingsTabChanged({ tab })
		}

		window.addEventListener("hashchange", handleHashChange)
		return () => window.removeEventListener("hashchange", handleHashChange)
	}, [])

	const headerDisplayName =
		user?.displayUsername || localStorageUsername || user?.name || ""
	const headerPossessive = headerDisplayName
		? `${headerDisplayName.split(" ")[0]}'s`
		: ""

	return (
		<div className="h-screen flex flex-col overflow-hidden">
			<header className="relative z-20 flex justify-between items-center gap-3 px-4 md:px-6 py-3 shrink-0">
				<nav
					className={cn(
						"flex items-center gap-2 sm:gap-3 min-w-0 text-sm",
						dmSansClassName(),
					)}
					aria-label="Breadcrumb"
				>
					<button
						type="button"
						onClick={() => router.push("/")}
						className={cn(
							"flex items-center min-w-0 rounded-lg py-1 pr-2 -ml-1 pl-1",
							"hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 transition-colors cursor-pointer text-left",
						)}
					>
						<Logo className="h-7 shrink-0" />
						{headerDisplayName ? (
							<div className="flex flex-col items-start justify-center ml-2 min-w-0">
								<p className="text-[#8B8B8B] text-[11px] leading-tight">
									{headerPossessive}
								</p>
								<p className="text-white font-bold text-xl leading-none -mt-1">
									supermemory
								</p>
							</div>
						) : (
							<span className="ml-2 font-medium text-white/90">
								supermemory
							</span>
						)}
					</button>
					<span className="text-white/35 shrink-0" aria-hidden>
						/
					</span>
					<span className="text-white/50 font-medium shrink-0">Settings</span>
				</nav>
				<UserProfileMenu />
			</header>
			<main className="flex-1 min-h-0 overflow-y-auto md:overflow-hidden">
				<div className="flex flex-col md:flex-row md:justify-center gap-4 md:gap-8 lg:gap-12 px-4 md:px-6 pt-4 pb-6 md:h-full">
					<div className="md:w-auto md:max-w-[380px] shrink-0">
						{!isMobile && (
							<motion.div
								animate={{
									scale: 1,
									padding: 48,
									paddingTop: 0,
								}}
								transition={{
									duration: 0.8,
									ease: "easeOut",
									delay: 0.2,
								}}
								className="relative flex items-center justify-center"
							>
								<NovaOrb size={175} className="blur-[3px]!" />
								<UserSupermemory name={user?.name ?? ""} />
							</motion.div>
						)}
						<nav
							className={cn(
								"flex gap-2",
								isMobile
									? "flex-row overflow-x-auto pb-2 scrollbar-thin"
									: "flex-col",
								dmSansClassName(),
							)}
						>
							{NAV_ITEMS.map((item) => (
								<button
									key={item.id}
									type="button"
									onClick={() => {
										window.location.hash = item.id
										setActiveTab(item.id)
										analytics.settingsTabChanged({ tab: item.id })
									}}
									className={cn(
										"rounded-xl transition-colors flex items-start gap-3 shrink-0",
										isMobile ? "px-3 py-2 text-sm" : "text-left p-4",
										activeTab === item.id
											? "bg-[#14161A] text-white shadow-[inset_2.42px_2.42px_4.263px_rgba(11,15,21,0.7)]"
											: "text-white/60 hover:text-white hover:bg-[#14161A] hover:shadow-[inset_2.42px_2.42px_4.263px_rgba(11,15,21,0.7)]",
									)}
								>
									<span className={cn("shrink-0", !isMobile && "mt-0.5")}>
										{item.icon}
									</span>
									{isMobile ? (
										<span className="font-medium whitespace-nowrap">
											{item.label}
										</span>
									) : (
										<div className="flex flex-col gap-0.5">
											<span className="font-medium">{item.label}</span>
											<span className="text-sm text-white/50">
												{item.description}
											</span>
										</div>
									)}
								</button>
							))}
						</nav>
					</div>
					<div className="flex-1 flex flex-col gap-4 md:overflow-y-auto md:max-w-2xl [scrollbar-gutter:stable] md:pr-[17px]">
						<ErrorBoundary
							key={activeTab}
							fallback={
								<p className="text-muted-foreground p-4">
									Something went wrong loading this section.{" "}
									<button
										type="button"
										className="underline cursor-pointer"
										onClick={() => window.location.reload()}
									>
										Reload
									</button>
								</p>
							}
						>
							{activeTab === "account" && <Account />}
							{activeTab === "integrations" && <Integrations />}
							{activeTab === "connections" && <ConnectionsMCP />}
							{activeTab === "support" && <Support />}
						</ErrorBoundary>
					</div>
				</div>
			</main>
		</div>
	)
}
