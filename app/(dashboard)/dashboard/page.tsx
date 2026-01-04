"use client"

import { Card } from "@/components/ui/card"
import { TrendingUp, AlertCircle } from "lucide-react"

const statsData = [
  { title: "Open Issues", value: "12", change: "+12 this week", icon: AlertCircle, color: "text-blue-500" },
  { title: "Pull Requests", value: "5", change: "2 waiting for review", icon: "🔀", color: "text-purple-500" },
  { title: "Code Review", value: "3", change: "Assignments", icon: "🎯", color: "text-orange-500" },
  { title: "Efficiency", value: "94%", change: "Top 10%", icon: TrendingUp, color: "text-green-500" },
]

const sprintData = [
  { id: "#1824", title: "Fix Login API timeout on slow connections", status: "To Do", assignee: "JD", priority: "bug" },
  { id: "#1045", title: "Update documentation for v2.0 release", status: "To Do", assignee: "JD", priority: "feat" },
  { id: "#1052", title: "Clean up unused assets in public folder", status: "To Do", assignee: "JD", priority: "chore" },
  {
    id: "#1033",
    title: "Refactor CSS Grid Layout for responsiveness",
    status: "Doing",
    assignee: "JD",
    priority: "refactor",
  },
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

export default function DashboardPage() {
  return (
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
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {["To Do", "Doing", "Done"].map((status) => (
              <div key={status} className="bg-[#151b2e] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="font-semibold text-white">{status}</h3>
                  <span className="bg-gray-700 text-gray-300 text-xs rounded-full px-2 py-1">
                    {sprintData.filter((d) => d.status === status).length}
                  </span>
                </div>
                <div className="space-y-3">
                  {sprintData
                    .filter((d) => d.status === status)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="bg-[#0f1419] border border-gray-700 rounded-lg p-3 hover:border-gray-600 transition cursor-pointer"
                      >
                        <p className="text-sm text-gray-300 mb-2">{item.title}</p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">{item.id}</span>
                          <span className={`px-2 py-1 rounded bg-gray-700 text-gray-300 capitalize`}>
                            {item.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
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
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${project.progress}%` }}></div>
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
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                        notif.type === "assign"
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
  )
}
