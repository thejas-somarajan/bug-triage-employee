"use client"

import { Suspense } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MoreVertical, Plus } from "lucide-react"

const projects = [
  {
    id: 1,
    name: "Q4 Web Redesign",
    description: "Overhaul of the main marketing website including new branding guidelines and...",
    status: "ON TRACK",
    statusColor: "bg-green-500/20 text-green-400",
    icon: "📱",
    progress: 75,
    dueDate: "Oct 30",
    team: ["JD", "AC", "MS"],
    tasks: { completed: 12, total: 16 },
    comments: 5,
  },
  {
    id: 2,
    name: "Mobile API Migration",
    description: "Migrating legacy REST endpoints to GraphQL for better mobile performance...",
    status: "AT RISK",
    statusColor: "bg-orange-500/20 text-orange-400",
    icon: "⚡",
    progress: 30,
    dueDate: "Nov 15",
    team: ["JD", "AC"],
    tasks: { completed: 8, total: 24 },
    comments: 12,
  },
  {
    id: 3,
    name: "Security Audit 2024",
    description: "Annual comprehensive security review of all public facing assets and internal...",
    status: "ON TRACK",
    statusColor: "bg-green-500/20 text-green-400",
    icon: "🔐",
    progress: 10,
    dueDate: "Dec 01",
    team: ["JD", "AC"],
    tasks: { completed: 2, total: 20 },
    comments: 1,
  },
  {
    id: 4,
    name: "Data Analytics Dashboard",
    description: "Building a new customer-facing dashboard for real-time data...",
    status: "ON TRACK",
    statusColor: "bg-green-500/20 text-green-400",
    icon: "📊",
    progress: 45,
    dueDate: "Jan 10",
    team: ["JD", "AC", "MS", "SJ"],
    tasks: { completed: 22, total: 48 },
    comments: 8,
  },
  {
    id: 5,
    name: "Design System Update",
    description: "Standardizing UI components across all products to ensure brand consistency.",
    status: "REVIEW",
    statusColor: "bg-blue-500/20 text-blue-400",
    icon: "🎨",
    progress: 90,
    dueDate: "Oct 15",
    team: ["JD"],
    tasks: { completed: 45, total: 50 },
    comments: 15,
  },
  {
    id: 6,
    name: "Cloud Migration Phase 2",
    description: "Moving secondary databases to AWS RDS and setting up auto-scaling groups.",
    status: "BLOCKED",
    statusColor: "bg-red-500/20 text-red-400",
    icon: "☁️",
    progress: 15,
    dueDate: "Nov 30",
    team: ["JD", "AC"],
    tasks: { completed: 5, total: 32 },
    comments: 3,
  },
]

function ProjectsContent() {
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Projects</h1>
        <p className="text-gray-400">Manage your team&apos;s ongoing initiatives and track progress.</p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search projects..."
              className="pl-10 bg-[#1f2937] border-gray-700 text-white placeholder-gray-500"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-gray-700 bg-transparent">
            All
          </Button>
          <Button variant="outline" className="border-gray-700 bg-transparent">
            Active
          </Button>
          <Button variant="outline" className="border-gray-700 bg-transparent">
            Completed
          </Button>
          <Button variant="outline" className="border-gray-700 bg-transparent">
            Filter
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card
            key={project.id}
            className="bg-[#151b2e] border-gray-700 overflow-hidden hover:border-gray-600 transition"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="text-3xl">{project.icon}</div>
                <button className="text-gray-400 hover:text-gray-200">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              {/* Status Badge */}
              <div className="mb-3">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${project.statusColor}`}>
                  {project.status}
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="text-lg font-bold text-white mb-2">{project.name}</h3>
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">{project.description}</p>

              {/* Team & Due Date */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex -space-x-2">
                  {project.team.map((member, idx) => (
                    <div
                      key={idx}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 border-2 border-[#151b2e] flex items-center justify-center text-white text-xs font-bold"
                    >
                      {member}
                    </div>
                  ))}
                  {project.team.length > 3 && (
                    <div className="w-8 h-8 rounded-full bg-gray-700 border-2 border-[#151b2e] flex items-center justify-center text-white text-xs font-bold">
                      +{project.team.length - 3}
                    </div>
                  )}
                </div>
                <span className="text-gray-400 text-sm">Due {project.dueDate}</span>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400 text-sm">Progress</span>
                  <span className="text-white font-semibold">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${project.progress}%` }}></div>
                </div>
              </div>

              {/* Footer Stats */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400 flex items-center gap-1">
                  ✓ {project.tasks.completed}/{project.tasks.total} Tasks
                </span>
                <span className="text-gray-400 flex items-center gap-1">💬 {project.comments} Comments</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="flex justify-center mt-8">
        <button className="text-blue-400 hover:text-blue-300 flex items-center gap-2 font-medium">
          🔄 Load More Projects
        </button>
      </div>
    </div>
  )
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={null}>
      <ProjectsContent />
    </Suspense>
  )
}
