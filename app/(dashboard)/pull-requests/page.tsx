"use client"

import { Suspense } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter } from "lucide-react"

const stats = [
  { label: "Open PRs", value: "8", icon: "🟢", change: "" },
  { label: "Merged (Week)", value: "14", icon: "🔀", change: "" },
  { label: "Review Needed", value: "3", icon: "🟠", change: "" },
  { label: "Avg Review Time", value: "4.2h", icon: "🕐", change: "" },
]

const pullRequests = [
  {
    id: "#1244",
    title: "Refactor authentication middleware for v2 API",
    labels: ["BACKEND", "REFACTOR"],
    labelColors: ["bg-blue-500/20 text-blue-400", "bg-orange-500/20 text-orange-400"],
    status: "Review Required",
    statusColor: "bg-orange-500/20 text-orange-400",
    openedTime: "4 hours ago",
    author: "Jane Doe",
    category: "Core API",
    avatars: ["JD", "AC"],
    reviewCount: 2,
  },
  {
    id: "#1241",
    title: "Update landing page hero section assets",
    labels: ["DESIGN"],
    labelColors: ["bg-purple-500/20 text-purple-400"],
    status: "Changes Requested",
    statusColor: "bg-red-500/20 text-red-400",
    openedTime: "Yesterday",
    author: "Mike Ross",
    category: "Web Front",
    avatars: ["MR"],
    reviewCount: 1,
  },
  {
    id: "#1238",
    title: "Fix broken links in documentation footer",
    labels: ["CHORE"],
    labelColors: ["bg-green-500/20 text-green-400"],
    status: "Merged",
    statusColor: "bg-green-500/20 text-green-400",
    openedTime: "2 days ago",
    author: "Sarah Connors",
    category: "Docs",
    avatars: ["SC"],
    reviewCount: 0,
  },
  {
    id: "#1235",
    title: "Implement dark mode toggle in navbar",
    labels: ["FEATURE", "UI"],
    labelColors: ["bg-blue-500/20 text-blue-400", "bg-pink-500/20 text-pink-400"],
    status: "Approved",
    statusColor: "bg-green-500/20 text-green-400",
    openedTime: "3 days ago",
    author: "Alex Chen",
    category: "Web Front",
    avatars: ["AC", "JD"],
    reviewCount: 0,
  },
  {
    id: "#1229",
    title: "Experimental: Use new Rust compiler for assets",
    labels: ["WIP"],
    labelColors: ["bg-gray-500/20 text-gray-400"],
    status: "Closed",
    statusColor: "bg-gray-500/20 text-gray-400",
    openedTime: "1 week ago",
    author: "DevOps Bot",
    category: "Infra",
    avatars: [],
    reviewCount: 0,
  },
]

function PullRequestsContent() {
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Pull Requests</h1>
          <p className="text-gray-400">Review, manage, and merge code contributions.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">+ New Pull Request</Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <Card key={idx} className="bg-[#151b2e] border-gray-700 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
                <h3 className="text-3xl font-bold text-white mt-2">{stat.value}</h3>
              </div>
              <span className="text-3xl">{stat.icon}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Filter by author, label..."
              className="pl-10 bg-[#1f2937] border-gray-700 text-white placeholder-gray-500"
            />
          </div>
        </div>
        <Button variant="outline" className="border-gray-700 gap-2 bg-transparent">
          <Filter className="w-4 h-4" />
          Sort: Newest
        </Button>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-4 border-b border-gray-700">
        <TabButton label="Open" count={8} active={true} />
        <TabButton label="Merged" count={142} active={false} />
        <TabButton label="Closed" count={24} active={false} />
      </div>

      {/* Pull Requests List */}
      <div className="space-y-4">
        {pullRequests.map((pr) => (
          <div
            key={pr.id}
            className="bg-[#151b2e] border border-gray-700 rounded-lg p-5 hover:border-gray-600 transition"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3 flex-1">
                <span className="text-xl">🟢</span>
                <div>
                  <h3 className="text-white font-semibold text-sm mb-1">{pr.title}</h3>
                  <p className="text-gray-400 text-xs">
                    {pr.id} opened {pr.openedTime} by {pr.author} • {pr.category}
                  </p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${pr.statusColor}`}>{pr.status}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                {pr.labels.map((label, idx) => (
                  <span key={idx} className={`px-2 py-1 rounded text-xs font-semibold ${pr.labelColors[idx]}`}>
                    {label}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-4">
                {pr.avatars.length > 0 && (
                  <div className="flex -space-x-2">
                    {pr.avatars.map((avatar, idx) => (
                      <div
                        key={idx}
                        className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 border border-[#151b2e] flex items-center justify-center text-white text-xs font-bold"
                      >
                        {avatar}
                      </div>
                    ))}
                    {pr.avatars.length > 1 && <span className="text-gray-400 text-xs ml-2">{pr.reviewCount}</span>}
                  </div>
                )}
                <span className="text-gray-400 text-sm">{pr.reviewCount}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-gray-400">
        <span>Showing 1 to 5 of 8 open pull requests</span>
        <div className="flex gap-2">
          <Button variant="outline" className="border-gray-700 bg-transparent">
            Previous
          </Button>
          <Button variant="outline" className="border-gray-700 bg-transparent">
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

function TabButton({ label, count, active }: any) {
  return (
    <button
      className={`px-4 py-2 border-b-2 text-sm font-medium transition ${
        active ? "border-blue-500 text-white" : "border-transparent text-gray-400 hover:text-gray-300"
      }`}
    >
      {label} {count}
    </button>
  )
}

export default function PullRequestsPage() {
  return (
    <Suspense fallback={null}>
      <PullRequestsContent />
    </Suspense>
  )
}
