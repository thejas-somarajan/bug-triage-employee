"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, ChevronDown } from "lucide-react"
import { useState } from "react"

const issues = [
  {
    id: "#1033",
    title: "Refactor CSS Grid Layout for responsiveness",
    priority: "REFACTOR",
    priorityColor: "bg-orange-500/20 text-orange-400",
    status: "Doing",
    statusColor: "bg-blue-500/20 text-blue-400",
    project: "Q4 Web Redesign",
    assignee: "JD",
    comments: 4,
  },
  {
    id: "#1024",
    title: "Fix Login API timeout on slow connections",
    priority: "BUG",
    priorityColor: "bg-red-500/20 text-red-400",
    status: "To Do",
    statusColor: "bg-gray-500/20 text-gray-400",
    project: "Mobile API",
    assignee: "Alex",
    comments: 2,
  },
  {
    id: "#1045",
    title: "Update documentation for v2.0 release",
    priority: "FEAT",
    priorityColor: "bg-blue-500/20 text-blue-400",
    status: "To Do",
    statusColor: "bg-gray-500/20 text-gray-400",
    project: "Documentation",
    assignee: "Sarah",
    comments: 0,
  },
  {
    id: "#1052",
    title: "Clean up unused assets in public folder",
    priority: "CHORE",
    priorityColor: "bg-green-500/20 text-green-400",
    status: "Done",
    statusColor: "bg-green-500/20 text-green-400",
    project: "Core System",
    assignee: "Jane",
    comments: 1,
  },
  {
    id: "#1040",
    title: "Memory leak in data parser",
    priority: "CRITICAL",
    priorityColor: "bg-red-500/20 text-red-400",
    status: "Doing",
    statusColor: "bg-blue-500/20 text-blue-400",
    project: "Backend Services",
    assignee: "Mike",
    comments: 8,
  },
  {
    id: "#1001",
    title: "Initial project scaffolding",
    priority: "SETUP",
    priorityColor: "bg-purple-500/20 text-purple-400",
    status: "Done",
    statusColor: "bg-green-500/20 text-green-400",
    project: "Core System",
    assignee: "Admin",
    comments: 0,
  },
]

export default function IssuesPage() {
  const [statusFilter, setStatusFilter] = useState("All")
  const [assigneeFilter, setAssigneeFilter] = useState("All")
  const [projectFilter, setProjectFilter] = useState("All")

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Issues List</h1>
          <p className="text-gray-400">Track, manage, and prioritize tasks across all projects.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
          <Plus className="w-4 h-4" />
          New Issue
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <FilterDropdown
          label="Status: All"
          value={statusFilter}
          onChange={setStatusFilter}
          options={["All", "To Do", "Doing", "Done", "Review"]}
        />
        <FilterDropdown
          label="Assignee: All"
          value={assigneeFilter}
          onChange={setAssigneeFilter}
          options={["All", "Jane Doe", "Alex", "Sarah", "Mike"]}
        />
        <FilterDropdown
          label="Project: All"
          value={projectFilter}
          onChange={setProjectFilter}
          options={["All", "Q4 Web Redesign", "Mobile API", "Core System", "Documentation"]}
        />
        <div className="flex-1 flex items-center gap-2">
          <Input placeholder="Sort by: Newest" className="bg-[#1f2937] border-gray-700 text-white" />
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
        <Button variant="outline" className="border-gray-700 gap-2 bg-transparent">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      {/* Issues Table */}
      <div className="bg-[#151b2e] border border-gray-700 rounded-lg overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-700 bg-[#0f1419] font-semibold text-gray-400 text-sm">
          <div className="col-span-5">ISSUE</div>
          <div className="col-span-2">STATUS</div>
          <div className="col-span-2">PROJECT</div>
          <div className="col-span-3">ASSIGNEE</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-700">
          {issues.map((issue) => (
            <div key={issue.id} className="grid grid-cols-12 gap-4 p-4 hover:bg-[#1f2937] transition items-center">
              <div className="col-span-5">
                <div className="flex items-start gap-3">
                  <span className="text-lg mt-1">✓</span>
                  <div>
                    <p className="text-white font-medium text-sm">{issue.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${issue.priorityColor}`}>
                        {issue.priority}
                      </span>
                      <span className="text-gray-500 text-xs">• Opened 2 days ago by {issue.assignee}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-span-2">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${issue.statusColor}`}>
                  {issue.status}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-300 text-sm">{issue.project}</span>
              </div>
              <div className="col-span-3 flex items-center justify-between">
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                    {issue.assignee.charAt(0)}
                  </div>
                </div>
                <span className="text-gray-500 text-sm">{issue.comments} comments</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-gray-400">
        <span>Showing 1-6 of 42 issues</span>
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

function FilterDropdown({ label, value, onChange, options }: any) {
  return (
    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1f2937] border border-gray-700 text-white hover:bg-[#2d3748] transition">
      {label}
      <ChevronDown className="w-4 h-4" />
    </button>
  )
}

import { Plus } from "lucide-react"
