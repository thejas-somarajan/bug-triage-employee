"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, Download, Loader2 } from "lucide-react"
import { getMyTasks } from "@/lib/tasks"
import type { Task, ProjectWithTasks } from "@/lib/types"

// ─── Priority styles ──────────────────────────────────────────────────────────
const priorityColor: Record<string, string> = {
  HIGH: "bg-red-500/20 text-red-400",
  MEDIUM: "bg-orange-500/20 text-orange-400",
  LOW: "bg-gray-500/20 text-gray-400",
  CRITICAL: "bg-red-700/30 text-red-300",
}

const statusColor: Record<string, string> = {
  UNASSIGNED: "bg-gray-500/20 text-gray-400",
  IN_PROGRESS: "bg-blue-500/20 text-blue-400",
  REVIEW: "bg-purple-500/20 text-purple-400",
  DONE: "bg-green-500/20 text-green-400",
}

const statusLabel: Record<string, string> = {
  UNASSIGNED: "To Do",
  IN_PROGRESS: "In Progress",
  REVIEW: "Review",
  DONE: "Done",
}

// ─── Flat task row type ───────────────────────────────────────────────────────
interface FlatTask extends Task {
  projectName: string
}

export default function IssuesPage() {
  const [allTasks, setAllTasks] = useState<FlatTask[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState("All")

  useEffect(() => {
    async function fetchTasks() {
      try {
        const data: ProjectWithTasks[] = await getMyTasks()
        const flat: FlatTask[] = data.flatMap((proj) =>
          proj.tasks.map((t) => ({ ...t, projectName: proj.project_name }))
        )
        setAllTasks(flat)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load issues")
      } finally {
        setIsLoading(false)
      }
    }
    fetchTasks()
  }, [])

  const filteredTasks = statusFilter === "All"
    ? allTasks
    : allTasks.filter((t) => t.status === statusFilter)

  const STATUS_OPTIONS = ["All", "UNASSIGNED", "IN_PROGRESS", "REVIEW", "DONE"]

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Issues List</h1>
          <p className="text-gray-400">Your assigned tasks across all projects.</p>
        </div>
        <Button variant="outline" className="border-gray-700 gap-2 bg-transparent">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt}
            onClick={() => setStatusFilter(opt)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition cursor-pointer ${statusFilter === opt
                ? "bg-blue-600 border-blue-600 text-white"
                : "bg-[#1f2937] border-gray-700 text-gray-400 hover:bg-[#2d3748]"
              }`}
          >
            {opt === "All" ? "All" : statusLabel[opt]}
          </button>
        ))}
        <span className="ml-auto flex items-center gap-1 text-gray-500 text-sm">
          <ChevronDown className="w-4 h-4" />
          Sort: Newest
        </span>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center gap-3 text-gray-400 justify-center py-20">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading issues…
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div className="bg-red-900/20 border border-red-700/40 rounded-xl p-6 text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      {/* Issues Table */}
      {!isLoading && !error && (
        <div className="bg-[#151b2e] border border-gray-700 rounded-lg overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-700 bg-[#0f1419] font-semibold text-gray-400 text-sm">
            <div className="col-span-5">ISSUE</div>
            <div className="col-span-2">STATUS</div>
            <div className="col-span-2">PROJECT</div>
            <div className="col-span-3">LABELS / ASSIGNED</div>
          </div>

          {/* Table Body */}
          {filteredTasks.length === 0 ? (
            <div className="py-16 text-center text-gray-500 text-sm">No issues found</div>
          ) : (
            <div className="divide-y divide-gray-700">
              {filteredTasks.map((task) => (
                <div key={task.id} className="grid grid-cols-12 gap-4 p-4 hover:bg-[#1f2937] transition items-center">
                  {/* Issue title + priority */}
                  <div className="col-span-5">
                    <div className="flex items-start gap-3">
                      <span className="text-lg mt-0.5">✓</span>
                      <div>
                        <p className="text-white font-medium text-sm">{task.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${priorityColor[task.priority] ?? "bg-gray-500/20 text-gray-400"}`}>
                            {task.priority}
                          </span>
                          <span className="text-gray-500 text-xs">
                            • #{task.github_issue_number}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="col-span-2">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColor[task.status] ?? "bg-gray-500/20 text-gray-400"}`}>
                      {statusLabel[task.status] ?? task.status}
                    </span>
                  </div>

                  {/* Project */}
                  <div className="col-span-2">
                    <span className="text-gray-300 text-sm truncate">{task.projectName}</span>
                  </div>

                  {/* Labels */}
                  <div className="col-span-3 flex flex-wrap gap-1">
                    {task.labels.slice(0, 3).map((label) => (
                      <span key={label} className="px-2 py-0.5 rounded bg-gray-700/50 text-gray-400 text-[10px] font-medium">
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Summary */}
      {!isLoading && !error && (
        <div className="text-sm text-gray-400">
          Showing {filteredTasks.length} of {allTasks.length} issues
        </div>
      )}
    </div>
  )
}
