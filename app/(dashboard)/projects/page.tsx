"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Loader2, CheckCircle2, Circle } from "lucide-react"
import { getMyTasks } from "@/lib/tasks"
import type { ProjectWithTasks } from "@/lib/types"

// ─── Derived project card ─────────────────────────────────────────────────────
interface ProjectCard {
  project_id: number
  project_name: string
  totalTasks: number
  doneTasks: number
  progressPct: number
  labels: string[]     // unique labels across all tasks in the project
}

function deriveProjects(data: ProjectWithTasks[]): ProjectCard[] {
  return data.map((proj) => {
    const total = proj.tasks.length
    const done = proj.tasks.filter((t) => t.status === "DONE").length
    const pct = total > 0 ? Math.round((done / total) * 100) : 0
    const labels = Array.from(
      new Set(proj.tasks.flatMap((t) => t.labels))
    ).slice(0, 4)
    return {
      project_id: proj.project_id,
      project_name: proj.project_name,
      totalTasks: total,
      doneTasks: done,
      progressPct: pct,
      labels,
    }
  })
}

// ─── Progress colour ──────────────────────────────────────────────────────────
function progressColor(pct: number): string {
  if (pct >= 80) return "bg-green-500"
  if (pct >= 40) return "bg-blue-500"
  return "bg-yellow-500"
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectCard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  useEffect(() => {
    async function fetchProjects() {
      try {
        const data = await getMyTasks()
        setProjects(deriveProjects(data))
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load projects")
      } finally {
        setIsLoading(false)
      }
    }
    fetchProjects()
  }, [])

  const filtered = projects.filter((p) =>
    p.project_name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Projects</h1>
        <p className="text-gray-400">Your assigned projects and task completion progress.</p>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search projects…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-[#1f2937] border-gray-700 text-white placeholder-gray-500"
          />
        </div>
        <span className="text-gray-500 text-sm">{filtered.length} project{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center gap-3 text-gray-400 justify-center py-20">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading projects…
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div className="bg-red-900/20 border border-red-700/40 rounded-xl p-6 text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && filtered.length === 0 && (
        <div className="py-16 text-center text-gray-500 text-sm">
          {search ? "No projects match your search" : "No projects assigned to you yet"}
        </div>
      )}

      {/* Projects Grid */}
      {!isLoading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-3 gap-6">
          {filtered.map((project) => (
            <Card
              key={project.project_id}
              className="bg-[#151b2e] border-gray-700 overflow-hidden hover:border-gray-600 transition"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="text-3xl">📦</div>
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${project.progressPct === 100
                      ? "bg-green-500/20 text-green-400"
                      : project.progressPct >= 50
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}>
                    {project.progressPct === 100 ? "COMPLETE" : project.progressPct >= 50 ? "ON TRACK" : "IN PROGRESS"}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-white mb-1">{project.project_name}</h3>

                {/* Labels */}
                {project.labels.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {project.labels.map((label) => (
                      <span key={label} className="px-2 py-0.5 rounded bg-gray-700/50 text-gray-400 text-[10px] font-medium">
                        {label}
                      </span>
                    ))}
                  </div>
                )}

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400 text-sm">Progress</span>
                    <span className="text-white font-semibold text-sm">{project.progressPct}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${progressColor(project.progressPct)}`}
                      style={{ width: `${project.progressPct}%` }}
                    />
                  </div>
                </div>

                {/* Footer stats */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    {project.doneTasks} / {project.totalTasks} Done
                  </span>
                  <span className="text-gray-400 flex items-center gap-1.5">
                    <Circle className="w-4 h-4 text-gray-600" />
                    {project.totalTasks - project.doneTasks} remaining
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
