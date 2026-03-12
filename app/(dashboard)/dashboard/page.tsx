"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { TrendingUp, AlertCircle, Loader2 } from "lucide-react"
import { getMyTasks, updateTaskStatus, createTask } from "@/lib/tasks"
import { useNotifications } from "@/hooks/use-notifications"
import type { ProjectWithTasks, TaskStatus } from "@/lib/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"

// ─── Types ─────────────────────────────────────────────────────────────────────
type SprintStatus = "To Do" | "Doing" | "Done" | "Review"

interface SprintItem {
  id: string          // display id e.g. "#12"
  issueId: number     // real API id for updates
  title: string
  status: SprintStatus
  priority: string
  projectName: string
}

// ─── Status mapping ────────────────────────────────────────────────────────────
function apiStatusToSprint(s: TaskStatus): SprintStatus {
  switch (s) {
    case "IN_PROGRESS": return "Doing"
    case "DONE": return "Done"
    case "REVIEW": return "Review"
    default: return "To Do"
  }
}

function sprintStatusToApi(s: SprintStatus): TaskStatus {
  switch (s) {
    case "Doing": return "IN_PROGRESS"
    case "Done": return "DONE"
    case "Review": return "REVIEW"
    default: return "UNASSIGNED"
  }
}

// ─── Priority badge colours ────────────────────────────────────────────────────
const priorityColours: Record<string, string> = {
  HIGH: "bg-red-600/20 text-red-400 border border-red-600/30",
  MEDIUM: "bg-yellow-600/20 text-yellow-400 border border-yellow-600/30",
  LOW: "bg-gray-600/20 text-gray-400 border border-gray-600/30",
  CRITICAL: "bg-red-700/30 text-red-300 border border-red-700/40",
  bug: "bg-red-600/20 text-red-400 border border-red-600/30",
  feat: "bg-blue-600/20 text-blue-400 border border-blue-600/30",
  chore: "bg-gray-600/20 text-gray-400 border border-gray-600/30",
  refactor: "bg-yellow-600/20 text-yellow-400 border border-yellow-600/30",
  setup: "bg-green-600/20 text-green-400 border border-green-600/30",
}

// ─── Column accent colours ─────────────────────────────────────────────────────
const columnAccent: Record<SprintStatus, string> = {
  "To Do": "border-t-blue-500",
  Doing: "border-t-yellow-500",
  Done: "border-t-green-500",
  Review: "border-t-purple-500",
}
const columnDotColour: Record<SprintStatus, string> = {
  "To Do": "bg-blue-500",
  Doing: "bg-yellow-500",
  Done: "bg-green-500",
  Review: "bg-purple-500",
}

// ─── Confirmation Dialog ───────────────────────────────────────────────────────
interface ConfirmDialogProps {
  cardTitle: string
  from: SprintStatus
  to: SprintStatus
  onConfirm: () => void
  onCancel: () => void
}

function ConfirmDialog({ cardTitle, from, to, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="bg-[#151b2e] border border-gray-700 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 animate-in fade-in zoom-in-95 duration-200"
        style={{ boxShadow: "0 25px 60px rgba(0,0,0,0.6)" }}
      >
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600/20 border border-blue-600/30 mx-auto mb-4">
          <span className="text-2xl">📋</span>
        </div>
        <h3 className="text-white text-lg font-bold text-center mb-1">Move Task?</h3>
        <p className="text-gray-400 text-sm text-center mb-5 leading-relaxed">
          Are you sure you want to move&nbsp;
          <span className="text-white font-semibold">&ldquo;{cardTitle}&rdquo;</span>
          &nbsp;from&nbsp;
          <span className="font-semibold text-yellow-400">{from}</span>
          &nbsp;→&nbsp;
          <span className="font-semibold text-green-400">{to}</span>?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-600 text-gray-300 text-sm font-medium hover:bg-gray-700/50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors cursor-pointer"
          >
            Yes, Move It
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [sprintData, setSprintData] = useState<SprintItem[]>([])
  const [projects, setProjects] = useState<ProjectWithTasks[]>([])
  const [isTasksLoading, setIsTasksLoading] = useState(true)
  const [tasksError, setTasksError] = useState<string | null>(null)

  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<SprintStatus | null>(null)
  const [pending, setPending] = useState<{ id: string; to: SprintStatus } | null>(null)
  const dragCounter = useRef<Record<string, number>>({})

  const { notifications, markRead } = useNotifications()

  // ── Fetch tasks on mount ─────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchTasks() {
      try {
        const data = await getMyTasks()
        setProjects(data)
        // Flatten all tasks from all projects into sprint items
        const items: SprintItem[] = data.flatMap((proj) =>
          proj.tasks.map((t) => ({
            id: `#${t.id}`,
            issueId: t.id,
            title: t.title,
            status: apiStatusToSprint(t.status),
            priority: t.priority,
            projectName: proj.project_name,
          }))
        )
        setSprintData(items)
      } catch (err) {
        setTasksError(err instanceof Error ? err.message : "Failed to load tasks")
      } finally {
        setIsTasksLoading(false)
      }
    }
    fetchTasks()
  }, [])

  // ── Derived stats ─────────────────────────────────────────────────────────────
  const openCount = sprintData.filter((t) => t.status === "To Do").length
  const doingCount = sprintData.filter((t) => t.status === "Doing").length
  const reviewCount = sprintData.filter((t) => t.status === "Review").length
  const doneCount = sprintData.filter((t) => t.status === "Done").length
  const efficiency = sprintData.length > 0
    ? Math.round((doneCount / sprintData.length) * 100)
    : 0

  const statsData = [
    { title: "Open Issues", value: String(openCount), change: `${doingCount} in progress`, icon: AlertCircle, color: "text-blue-500" },
    { title: "In Review", value: String(reviewCount), change: "Awaiting review", icon: "🔀", color: "text-purple-500" },
    { title: "Completed", value: String(doneCount), change: "Tasks done", icon: "🎯", color: "text-orange-500" },
    { title: "Efficiency", value: `${efficiency}%`, change: "Done / total tasks", icon: TrendingUp, color: "text-green-500" },
  ]

  // ── Drag handlers ────────────────────────────────────────────────────────────
  function handleDragStart(id: string) { setDraggedId(id) }
  function handleDragEnd() { setDraggedId(null); setDragOverColumn(null); dragCounter.current = {} }

  function handleColumnDragEnter(status: SprintStatus) {
    dragCounter.current[status] = (dragCounter.current[status] ?? 0) + 1
    setDragOverColumn(status)
  }
  function handleColumnDragLeave(status: SprintStatus) {
    dragCounter.current[status] = (dragCounter.current[status] ?? 1) - 1
    if (dragCounter.current[status] <= 0) {
      dragCounter.current[status] = 0
      setDragOverColumn((prev) => (prev === status ? null : prev))
    }
  }
  function handleColumnDrop(toStatus: SprintStatus) {
    setDragOverColumn(null)
    dragCounter.current = {}
    if (!draggedId) return
    const card = sprintData.find((c) => c.id === draggedId)
    if (!card || card.status === toStatus) { setDraggedId(null); return }
    setPending({ id: draggedId, to: toStatus })
    setDraggedId(null)
  }

  const confirmMove = useCallback(async () => {
    if (!pending) return
    const prevData = sprintData
    // Optimistic update
    setSprintData((prev) =>
      prev.map((c) => (c.id === pending.id ? { ...c, status: pending.to } : c))
    )
    setPending(null)
    // Persist to API
    const card = prevData.find((c) => c.id === pending.id)
    if (card) {
      try {
        await updateTaskStatus(card.issueId, sprintStatusToApi(pending.to))
      } catch {
        // Revert on failure
        setSprintData(prevData)
      }
    }
  }, [pending, sprintData])

  function cancelMove() { setPending(null) }

  const pendingCard = pending ? sprintData.find((c) => c.id === pending.id) : null
  const COLUMNS: SprintStatus[] = ["To Do", "Doing", "Review", "Done"]

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Confirmation Dialog */}
      {pending && pendingCard && (
        <ConfirmDialog
          cardTitle={pendingCard.title}
          from={pendingCard.status}
          to={pending.to}
          onConfirm={confirmMove}
          onCancel={cancelMove}
        />
      )}

      <div className="p-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4">
          {statsData.map((stat, idx) => (
            <Card key={idx} className="bg-[#151b2e] border-gray-700 p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
                  <h3 className="text-3xl font-bold text-white mt-1">{stat.value}</h3>
                </div>
                <div className={`text-2xl ${typeof stat.icon === "string" ? "" : "text-gray-400"}`}>
                  {typeof stat.icon === "string" ? stat.icon : <stat.icon className="w-6 h-6" />}
                </div>
              </div>
              <p className={`text-sm font-medium ${stat.title === "Efficiency" ? "text-green-400" : "text-gray-400"}`}>
                {stat.change}
              </p>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-8">
          {/* Sprint Board */}
          <div className="col-span-2">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="text-2xl">📋</span>
              Sprint Board
              <span className="ml-2 text-xs text-gray-500 font-normal italic mr-auto">drag cards between columns</span>
              <CreateTaskDialog projects={projects} onTaskCreated={(newTask) => {
                const item: SprintItem = {
                  id: `#${newTask.id}`,
                  issueId: newTask.id,
                  title: newTask.title,
                  status: "To Do",
                  priority: newTask.priority || "MEDIUM",
                  projectName: projects.find(p => p.project_id === newTask.project_id)?.project_name || "Unknown"
                }
                setSprintData(prev => [item, ...prev])
              }} />
            </h2>

            {/* Loading / Error states */}
            {isTasksLoading && (
              <div className="flex items-center gap-3 text-gray-400 py-16 justify-center">
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading your tasks…
              </div>
            )}
            {tasksError && !isTasksLoading && (
              <div className="bg-red-900/20 border border-red-700/40 rounded-xl p-6 text-red-400 text-sm text-center">
                {tasksError}
              </div>
            )}

            {!isTasksLoading && !tasksError && (
              <div className="grid grid-cols-4 gap-3">
                {COLUMNS.map((status) => {
                  const colCards = sprintData.filter((d) => d.status === status)
                  const isOver = dragOverColumn === status
                  return (
                    <div
                      key={status}
                      onDragOver={(e) => e.preventDefault()}
                      onDragEnter={() => handleColumnDragEnter(status)}
                      onDragLeave={() => handleColumnDragLeave(status)}
                      onDrop={() => handleColumnDrop(status)}
                      className={`rounded-xl p-3 border-t-2 transition-all duration-200 ${columnAccent[status]} ${isOver
                          ? "bg-[#1c2540] border border-blue-500/50 shadow-lg shadow-blue-500/5 scale-[1.01]"
                          : "bg-[#151b2e] border border-gray-700/50"
                        }`}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`w-2 h-2 rounded-full ${columnDotColour[status]}`} />
                        <h3 className="font-semibold text-white text-xs">{status}</h3>
                        <span className="ml-auto bg-gray-700 text-gray-300 text-xs rounded-full px-2 py-0.5 font-medium">
                          {colCards.length}
                        </span>
                      </div>

                      {isOver && colCards.length === 0 && (
                        <div className="border-2 border-dashed border-blue-500/40 rounded-lg p-3 flex items-center justify-center text-blue-400/60 text-xs mb-2">
                          Drop here
                        </div>
                      )}

                      <div className="space-y-2 min-h-[60px]">
                        {colCards.map((item) => {
                          const isDragging = draggedId === item.id
                          return (
                            <div
                              key={item.id}
                              draggable
                              onDragStart={() => handleDragStart(item.id)}
                              onDragEnd={handleDragEnd}
                              className={`bg-[#0f1419] border rounded-xl p-3 transition-all duration-150 select-none group ${isDragging
                                  ? "opacity-40 scale-95 border-blue-500/50 shadow-lg shadow-blue-500/10"
                                  : "border-gray-700 hover:border-gray-500 hover:shadow-md hover:shadow-black/30 cursor-grab active:cursor-grabbing"
                                }`}
                              style={{ cursor: isDragging ? "grabbing" : "grab" }}
                            >
                              <div className="flex items-start gap-2 mb-2">
                                <span className="text-gray-600 group-hover:text-gray-400 transition-colors mt-0.5 text-xs select-none">⠿</span>
                                <p className="text-xs text-gray-300 leading-snug flex-1">{item.title}</p>
                              </div>
                              <div className="flex items-center justify-between text-xs pl-4">
                                <span className="text-gray-500 font-mono text-[10px]">{item.id}</span>
                                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-medium uppercase ${priorityColours[item.priority] ?? "bg-gray-700 text-gray-300"
                                  }`}>
                                  {item.priority}
                                </span>
                              </div>
                            </div>
                          )
                        })}
                        {isOver && colCards.length > 0 && (
                          <div className="border-2 border-dashed border-blue-500/30 rounded-lg p-2 flex items-center justify-center text-blue-400/50 text-xs">
                            Drop here
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Active Projects */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">📁</span>
                Active Projects
              </h3>
              <div className="space-y-3">
                {isTasksLoading && (
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading…
                  </div>
                )}
                {!isTasksLoading && projects.map((proj) => {
                  const done = proj.tasks.filter((t) => t.status === "DONE").length
                  const total = proj.tasks.length
                  const pct = total > 0 ? Math.round((done / total) * 100) : 0
                  return (
                    <div key={proj.project_id} className="bg-[#151b2e] border border-gray-700 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white text-sm">📦</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium text-sm truncate">{proj.project_name}</p>
                          <p className="text-gray-400 text-xs">{done}/{total} tasks done</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-700 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-white text-sm font-medium">{pct}%</span>
                      </div>
                    </div>
                  )
                })}
                {!isTasksLoading && projects.length === 0 && !tasksError && (
                  <p className="text-gray-500 text-sm">No active projects</p>
                )}
              </div>
            </div>

            {/* Notifications */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">🔔</span>
                Notifications
              </h3>
              <div className="space-y-3">
                {notifications.length === 0 && (
                  <p className="text-gray-500 text-sm">No notifications</p>
                )}
                {notifications.slice(0, 5).map((notif) => (
                  <button
                    key={notif.id}
                    onClick={() => { if (!notif.read) markRead(notif.id) }}
                    className={`w-full text-left bg-[#151b2e] border border-gray-700 rounded-lg p-4 hover:bg-[#1f2937] transition cursor-pointer ${notif.read ? "opacity-60" : ""
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${notif.read ? "bg-gray-600" : "bg-blue-500"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold truncate">{notif.subject}</p>
                        <p className="text-gray-400 text-xs mt-0.5 line-clamp-2">{notif.content}</p>
                        <p className="text-gray-500 text-xs mt-1">{notif.sender_name}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
function CreateTaskDialog({ projects, onTaskCreated }: { projects: ProjectWithTasks[], onTaskCreated: (task: any) => void }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [priority, setPriority] = useState("MEDIUM")
  const [projectId, setProjectId] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (projects.length > 0 && !projectId) {
      setProjectId(String(projects[0].project_id))
    }
  }, [projects, projectId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsSubmitting(true)
    try {
      const res = await createTask({
        title,
        priority,
        project_id: projectId ? parseInt(projectId) : undefined
      })
      onTaskCreated({ ...res.data, project_id: projectId ? parseInt(projectId) : undefined, priority })
      setOpen(false)
      setTitle("")
    } catch (error) {
      console.error("Failed to create task:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 h-8 gap-1.5 px-3">
          <Plus className="w-4 h-4" />
          <span>Create Task</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#151b2e] border-gray-700 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-gray-400">Task Title</Label>
            <Input
              id="title"
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-[#1c2540] border-gray-700 text-white placeholder:text-gray-500"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-400">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="bg-[#1c2540] border-gray-700 text-white">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent className="bg-[#1c2540] border-gray-700 text-white">
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-400">Project</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger className="bg-[#1c2540] border-gray-700 text-white">
                  <SelectValue placeholder="Project" />
                </SelectTrigger>
                <SelectContent className="bg-[#1c2540] border-gray-700 text-white">
                  {projects.map(p => (
                    <SelectItem key={p.project_id} value={String(p.project_id)}>
                      {p.project_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-gray-700 text-gray-400 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white min-w-[100px]"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
