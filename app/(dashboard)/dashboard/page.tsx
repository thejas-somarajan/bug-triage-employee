"use client"

import { useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { TrendingUp, AlertCircle } from "lucide-react"

// ─── Types ─────────────────────────────────────────────────────────────────────
type SprintStatus = "To Do" | "Doing" | "Done"

interface SprintItem {
  id: string
  title: string
  status: SprintStatus
  assignee: string
  priority: string
}

// ─── Static data ───────────────────────────────────────────────────────────────
const statsData = [
  { title: "Open Issues", value: "12", change: "+12 this week", icon: AlertCircle, color: "text-blue-500" },
  { title: "Pull Requests", value: "5", change: "2 waiting for review", icon: "🔀", color: "text-purple-500" },
  { title: "Code Review", value: "3", change: "Assignments", icon: "🎯", color: "text-orange-500" },
  { title: "Efficiency", value: "94%", change: "Top 10%", icon: TrendingUp, color: "text-green-500" },
]

const initialSprintData: SprintItem[] = [
  { id: "#1824", title: "Fix Login API timeout on slow connections", status: "To Do", assignee: "JD", priority: "bug" },
  { id: "#1045", title: "Update documentation for v2.0 release", status: "To Do", assignee: "JD", priority: "feat" },
  { id: "#1052", title: "Clean up unused assets in public folder", status: "To Do", assignee: "JD", priority: "chore" },
  { id: "#1033", title: "Refactor CSS Grid Layout for responsiveness", status: "Doing", assignee: "JD", priority: "refactor" },
  { id: "#1040", title: "Memory leak in data parser", status: "Doing", assignee: "JD", priority: "critical" },
  { id: "#1003", title: "Initial project scaffolding", status: "Done", assignee: "JD", priority: "setup" },
]

const activeProjects = [
  { name: "Q4 Web Redesign", progress: 75, deadline: "Oct 30" },
  { name: "Mobile API Migration", progress: 30, deadline: "Nov 15" },
  { name: "Security Audit", progress: 10, deadline: "Dec 01" },
]

const notifications = [
  { type: "assign", message: "Alex assigned you to #42", time: "10 min ago", avatar: "A" },
  { type: "error", message: "Build failed: main-branch", time: "1 hour ago" },
  { type: "success", message: "Pull Request #99 merged", time: "3 hours ago" },
  { type: "comment", message: "Sarah commented on #33", time: "Yesterday" },
]

// ─── Priority badge colours ────────────────────────────────────────────────────
const priorityColours: Record<string, string> = {
  bug: "bg-red-600/20 text-red-400 border border-red-600/30",
  feat: "bg-blue-600/20 text-blue-400 border border-blue-600/30",
  chore: "bg-gray-600/20 text-gray-400 border border-gray-600/30",
  refactor: "bg-yellow-600/20 text-yellow-400 border border-yellow-600/30",
  critical: "bg-red-700/30 text-red-300 border border-red-700/40",
  setup: "bg-green-600/20 text-green-400 border border-green-600/30",
}

// ─── Column accent colours ─────────────────────────────────────────────────────
const columnAccent: Record<SprintStatus, string> = {
  "To Do": "border-t-blue-500",
  Doing: "border-t-yellow-500",
  Done: "border-t-green-500",
}

const columnDotColour: Record<SprintStatus, string> = {
  "To Do": "bg-blue-500",
  Doing: "bg-yellow-500",
  Done: "bg-green-500",
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
        {/* Icon */}
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
  const [sprintData, setSprintData] = useState<SprintItem[]>(initialSprintData)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<SprintStatus | null>(null)

  // Dialog state
  const [pending, setPending] = useState<{ id: string; to: SprintStatus } | null>(null)

  const dragCounter = useRef<Record<string, number>>({})  // per-column enter/leave counter

  // ── Drag handlers ────────────────────────────────────────────────────────────
  function handleDragStart(id: string) {
    setDraggedId(id)
  }

  function handleDragEnd() {
    setDraggedId(null)
    setDragOverColumn(null)
    dragCounter.current = {}
  }

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
    if (!card) return
    if (card.status === toStatus) {
      setDraggedId(null)
      return
    }

    // Show confirmation dialog instead of moving immediately
    setPending({ id: draggedId, to: toStatus })
    setDraggedId(null)
  }

  function confirmMove() {
    if (!pending) return
    setSprintData((prev) =>
      prev.map((c) => (c.id === pending.id ? { ...c, status: pending.to } : c))
    )
    setPending(null)
  }

  function cancelMove() {
    setPending(null)
  }

  // ── Derive dialog info ───────────────────────────────────────────────────────
  const pendingCard = pending ? sprintData.find((c) => c.id === pending.id) : null

  // ── Render ───────────────────────────────────────────────────────────────────
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
              <span className="ml-2 text-xs text-gray-500 font-normal italic">drag cards between columns</span>
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {(["To Do", "Doing", "Done"] as SprintStatus[]).map((status) => {
                const colCards = sprintData.filter((d) => d.status === status)
                const isOver = dragOverColumn === status

                return (
                  <div
                    key={status}
                    onDragOver={(e) => e.preventDefault()}
                    onDragEnter={() => handleColumnDragEnter(status)}
                    onDragLeave={() => handleColumnDragLeave(status)}
                    onDrop={() => handleColumnDrop(status)}
                    className={`rounded-xl p-4 border-t-2 transition-all duration-200 ${columnAccent[status]} ${isOver
                        ? "bg-[#1c2540] border border-blue-500/50 shadow-lg shadow-blue-500/5 scale-[1.01]"
                        : "bg-[#151b2e] border border-gray-700/50"
                      }`}
                  >
                    {/* Column header */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className={`w-2 h-2 rounded-full ${columnDotColour[status]}`} />
                      <h3 className="font-semibold text-white text-sm">{status}</h3>
                      <span className="ml-auto bg-gray-700 text-gray-300 text-xs rounded-full px-2 py-0.5 font-medium">
                        {colCards.length}
                      </span>
                    </div>

                    {/* Drop zone hint */}
                    {isOver && colCards.length === 0 && (
                      <div className="border-2 border-dashed border-blue-500/40 rounded-lg p-4 flex items-center justify-center text-blue-400/60 text-xs mb-3">
                        Drop here
                      </div>
                    )}

                    {/* Cards */}
                    <div className="space-y-3 min-h-[60px]">
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
                            {/* Drag handle hint */}
                            <div className="flex items-start gap-2 mb-2">
                              <span className="text-gray-600 group-hover:text-gray-400 transition-colors mt-0.5 text-xs select-none">
                                ⠿
                              </span>
                              <p className="text-sm text-gray-300 leading-snug flex-1">{item.title}</p>
                            </div>
                            <div className="flex items-center justify-between text-xs pl-4">
                              <span className="text-gray-500 font-mono">{item.id}</span>
                              <span
                                className={`px-2 py-0.5 rounded-md text-xs font-medium capitalize ${priorityColours[item.priority] ?? "bg-gray-700 text-gray-300"
                                  }`}
                              >
                                {item.priority}
                              </span>
                            </div>
                          </div>
                        )
                      })}

                      {/* Drop zone hint when column has cards */}
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
                {activeProjects.map((project, idx) => (
                  <div key={idx} className="bg-[#151b2e] border border-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white text-sm">
                        📦
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm">{project.name}</p>
                        <p className="text-gray-400 text-xs">Deadline: {project.deadline}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${project.progress}%` }} />
                      </div>
                      <span className="text-white text-sm font-medium">{project.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notifications */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">🔔</span>
                Notifications
              </h3>
              <div className="space-y-3">
                {notifications.map((notif, idx) => (
                  <div key={idx} className="bg-[#151b2e] border border-gray-700 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${notif.type === "assign"
                            ? "bg-blue-600 text-white"
                            : notif.type === "error"
                              ? "bg-red-600/20 text-red-400"
                              : notif.type === "success"
                                ? "bg-green-600/20 text-green-400"
                                : "bg-gray-600 text-white"
                          }`}
                      >
                        {notif.avatar || (notif.type === "error" ? "⚠️" : notif.type === "success" ? "✓" : "💬")}
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm">{notif.message}</p>
                        <p className="text-gray-500 text-xs">{notif.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
