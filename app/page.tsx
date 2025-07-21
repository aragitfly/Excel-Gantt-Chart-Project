"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { FileSpreadsheet, List, BarChart3, Upload, Mic, FileText } from "lucide-react"
import * as XLSX from "xlsx"
import { MeetingRecorder } from "../components/meeting-recorder"
import { TaskManager } from "../components/task-manager"
import { MeetingSummary } from "../components/meeting-summary"
import { DesignSelector } from "../components/design-selector"

export interface Task {
  id: string
  name: string
  startDate: Date
  endDate: Date
  duration: number
  progress: number
  assignee?: string
  priority: "Low" | "Medium" | "High"
  status: "Not Started" | "In Progress" | "Completed" | "Delayed" | "Blocked"
  dependencies?: string[]
  auditTrail: AuditEntry[]
  proposedChanges?: TaskProposal
}

export interface AuditEntry {
  id: string
  timestamp: Date
  type: "manual" | "meeting" | "system"
  field: string
  oldValue: any
  newValue: any
  reason?: string
  meetingId?: string
  userId?: string
}

export interface TaskProposal {
  id: string
  taskId: string
  proposedStatus?: Task["status"]
  proposedProgress?: number
  proposedEndDate?: Date
  reason: string
  confidence: number
  meetingId: string
  timestamp: Date
}

export interface Meeting {
  id: string
  title: string
  date: Date
  duration: number
  transcript: string
  summary: string
  taskProposals: TaskProposal[]
  audioBlob?: Blob
}

export type DesignTheme = "default" | "modern" | "minimal" | "corporate" | "dark"

export default function ProjectManager() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [fileName, setFileName] = useState<string>("")
  const [activeTab, setActiveTab] = useState("gantt")
  const [currentTheme, setCurrentTheme] = useState<DesignTheme>("default")

  // Sample data for demonstration
  const sampleTasks: Task[] = [
    {
      id: "1",
      name: "Project Planning",
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-01-15"),
      duration: 14,
      progress: 100,
      assignee: "John Doe",
      priority: "High",
      status: "Completed",
      auditTrail: [
        {
          id: "audit-1",
          timestamp: new Date("2024-01-01"),
          type: "manual",
          field: "status",
          oldValue: "Not Started",
          newValue: "In Progress",
          reason: "Project kickoff",
        },
        {
          id: "audit-2",
          timestamp: new Date("2024-01-15"),
          type: "manual",
          field: "status",
          oldValue: "In Progress",
          newValue: "Completed",
          reason: "All planning documents finalized",
        },
      ],
    },
    {
      id: "2",
      name: "Requirements Gathering",
      startDate: new Date("2024-01-10"),
      endDate: new Date("2024-01-25"),
      duration: 15,
      progress: 80,
      assignee: "Jane Smith",
      priority: "High",
      status: "In Progress",
      auditTrail: [
        {
          id: "audit-3",
          timestamp: new Date("2024-01-10"),
          type: "manual",
          field: "status",
          oldValue: "Not Started",
          newValue: "In Progress",
          reason: "Started stakeholder interviews",
        },
      ],
    },
    {
      id: "3",
      name: "Design Phase",
      startDate: new Date("2024-01-20"),
      endDate: new Date("2024-02-10"),
      duration: 21,
      progress: 45,
      assignee: "Mike Johnson",
      priority: "Medium",
      status: "Delayed",
      auditTrail: [
        {
          id: "audit-4",
          timestamp: new Date("2024-01-20"),
          type: "manual",
          field: "status",
          oldValue: "Not Started",
          newValue: "In Progress",
          reason: "Design work started",
        },
        {
          id: "audit-5",
          timestamp: new Date("2024-02-01"),
          type: "meeting",
          field: "status",
          oldValue: "In Progress",
          newValue: "Delayed",
          reason: "Waiting for client feedback on mockups",
          meetingId: "meeting-1",
        },
      ],
    },
  ]

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        const parsedTasks: Task[] = jsonData.map((row: any, index: number) => ({
          id: (index + 1).toString(),
          name: row["Task Name"] || row["Name"] || row["Task"] || `Task ${index + 1}`,
          startDate: row["Start Date"] ? new Date(row["Start Date"]) : new Date(),
          endDate: row["End Date"] ? new Date(row["End Date"]) : new Date(),
          duration: row["Duration"] || 1,
          progress: row["Progress"] || row["% Complete"] || 0,
          assignee: row["Assignee"] || row["Resource"] || "Unassigned",
          priority: row["Priority"] || "Medium",
          status: row["Status"] || "Not Started",
          auditTrail: [
            {
              id: `audit-${index + 1}`,
              timestamp: new Date(),
              type: "system",
              field: "imported",
              oldValue: null,
              newValue: "imported from Excel",
              reason: "Initial import",
            },
          ],
        }))

        setTasks(parsedTasks)
      } catch (error) {
        console.error("Error parsing Excel file:", error)
        setTasks(sampleTasks)
      }
    }

    reader.readAsArrayBuffer(file)
  }

  const loadSampleData = () => {
    setTasks(sampleTasks)
    setFileName("sample-project.xlsx")
  }

  const handleMeetingComplete = (meeting: Meeting) => {
    setMeetings((prev) => [...prev, meeting])

    const updatedTasks = tasks.map((task) => {
      const proposal = meeting.taskProposals.find((p) => p.taskId === task.id)
      if (proposal) {
        return {
          ...task,
          proposedChanges: proposal,
        }
      }
      return task
    })

    setTasks(updatedTasks)
  }

  const handleTaskUpdate = (taskId: string, updates: Partial<Task>, reason: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          const auditEntries: AuditEntry[] = []

          Object.entries(updates).forEach(([field, newValue]) => {
            if (field !== "auditTrail" && task[field as keyof Task] !== newValue) {
              auditEntries.push({
                id: `audit-${Date.now()}-${field}`,
                timestamp: new Date(),
                type: "manual",
                field,
                oldValue: task[field as keyof Task],
                newValue,
                reason,
              })
            }
          })

          return {
            ...task,
            ...updates,
            auditTrail: [...task.auditTrail, ...auditEntries],
            proposedChanges: undefined,
          }
        }
        return task
      }),
    )
  }

  const getThemeClasses = () => {
    switch (currentTheme) {
      case "modern":
        return {
          container: "bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen",
          card: "bg-white/80 backdrop-blur-sm border-0 shadow-xl",
          header: "bg-gradient-to-r from-blue-600 to-purple-600 text-white",
          accent: "text-blue-600",
        }
      case "minimal":
        return {
          container: "bg-gray-50 min-h-screen",
          card: "bg-white border border-gray-200 shadow-sm",
          header: "bg-white border-b border-gray-200",
          accent: "text-gray-900",
        }
      case "corporate":
        return {
          container: "bg-slate-100 min-h-screen",
          card: "bg-white border border-slate-300 shadow-md",
          header: "bg-slate-800 text-white",
          accent: "text-slate-700",
        }
      case "dark":
        return {
          container: "bg-gray-900 min-h-screen text-white",
          card: "bg-gray-800 border border-gray-700 shadow-xl",
          header: "bg-gray-800 border-b border-gray-700 text-white",
          accent: "text-blue-400",
        }
      default:
        return {
          container: "bg-background min-h-screen",
          card: "bg-card",
          header: "bg-background",
          accent: "text-primary",
        }
    }
  }

  const themeClasses = getThemeClasses()

  const getPriorityColor = (priority: string) => {
    const colors = {
      default: {
        High: "bg-red-500",
        Medium: "bg-yellow-500",
        Low: "bg-green-500",
      },
      modern: {
        High: "bg-gradient-to-r from-red-500 to-pink-500",
        Medium: "bg-gradient-to-r from-yellow-500 to-orange-500",
        Low: "bg-gradient-to-r from-green-500 to-emerald-500",
      },
      minimal: {
        High: "bg-gray-800",
        Medium: "bg-gray-600",
        Low: "bg-gray-400",
      },
      corporate: {
        High: "bg-red-600",
        Medium: "bg-amber-600",
        Low: "bg-green-600",
      },
      dark: {
        High: "bg-red-400",
        Medium: "bg-yellow-400",
        Low: "bg-green-400",
      },
    }
    return (
      colors[currentTheme]?.[priority as keyof typeof colors.default] ||
      colors.default[priority as keyof typeof colors.default] ||
      "bg-gray-500"
    )
  }

  const getStatusColor = (status: string) => {
    const colors = {
      default: {
        Completed: "bg-green-100 text-green-800",
        "In Progress": "bg-blue-100 text-blue-800",
        "Not Started": "bg-gray-100 text-gray-800",
        Delayed: "bg-orange-100 text-orange-800",
        Blocked: "bg-red-100 text-red-800",
      },
      modern: {
        Completed: "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800",
        "In Progress": "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800",
        "Not Started": "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800",
        Delayed: "bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800",
        Blocked: "bg-gradient-to-r from-red-100 to-rose-100 text-red-800",
      },
      minimal: {
        Completed: "bg-gray-100 text-gray-800 border border-gray-300",
        "In Progress": "bg-gray-50 text-gray-700 border border-gray-300",
        "Not Started": "bg-white text-gray-600 border border-gray-300",
        Delayed: "bg-gray-100 text-gray-800 border border-gray-400",
        Blocked: "bg-gray-200 text-gray-900 border border-gray-400",
      },
      corporate: {
        Completed: "bg-green-50 text-green-700 border border-green-200",
        "In Progress": "bg-blue-50 text-blue-700 border border-blue-200",
        "Not Started": "bg-slate-50 text-slate-700 border border-slate-200",
        Delayed: "bg-amber-50 text-amber-700 border border-amber-200",
        Blocked: "bg-red-50 text-red-700 border border-red-200",
      },
      dark: {
        Completed: "bg-green-900/50 text-green-300 border border-green-700",
        "In Progress": "bg-blue-900/50 text-blue-300 border border-blue-700",
        "Not Started": "bg-gray-800 text-gray-300 border border-gray-600",
        Delayed: "bg-orange-900/50 text-orange-300 border border-orange-700",
        Blocked: "bg-red-900/50 text-red-300 border border-red-700",
      },
    }
    return (
      colors[currentTheme]?.[status as keyof typeof colors.default] ||
      colors.default[status as keyof typeof colors.default] ||
      "bg-gray-100 text-gray-800"
    )
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getTaskPosition = (task: Task) => {
    if (tasks.length === 0) return { left: 0, width: 0 }

    const allDates = tasks.flatMap((t) => [t.startDate, t.endDate])
    const minDate = new Date(Math.min(...allDates.map((d) => d.getTime())))
    const maxDate = new Date(Math.max(...allDates.map((d) => d.getTime())))
    const totalDuration = maxDate.getTime() - minDate.getTime()

    const startOffset = task.startDate.getTime() - minDate.getTime()
    const taskDuration = task.endDate.getTime() - task.startDate.getTime()

    const left = (startOffset / totalDuration) * 100
    const width = (taskDuration / totalDuration) * 100

    return { left: `${left}%`, width: `${Math.max(width, 2)}%` }
  }

  return (
    <div className={themeClasses.container}>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${themeClasses.accent}`}>Project Management Dashboard</h1>
            <p className="text-muted-foreground">
              Import Excel files, record meetings, and track project progress with AI insights
            </p>
          </div>
          <div className="flex items-center gap-4">
            <DesignSelector currentTheme={currentTheme} onThemeChange={setCurrentTheme} />
            <div className="flex items-center gap-2">
              <BarChart3 className={`h-8 w-8 ${themeClasses.accent}`} />
            </div>
          </div>
        </div>

        <Card className={themeClasses.card}>
          <CardHeader className={themeClasses.header}>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Import Excel File
            </CardTitle>
            <CardDescription className={currentTheme === "dark" ? "text-gray-300" : ""}>
              Upload an Excel file with columns: Task Name, Start Date, End Date, Duration, Progress, Assignee,
              Priority, Status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="excel-file">Choose Excel File</Label>
                <Input id="excel-file" type="file" accept=".xlsx,.xls" onChange={handleFileUpload} className="mt-1" />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Or try sample data</Label>
                <Button onClick={loadSampleData} variant="outline">
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Load Sample
                </Button>
              </div>
            </div>
            {fileName && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileSpreadsheet className="h-4 w-4" />
                Loaded: {fileName}
              </div>
            )}
          </CardContent>
        </Card>

        {tasks.length > 0 && (
          <>
            <MeetingRecorder
              tasks={tasks}
              onMeetingComplete={handleMeetingComplete}
              theme={currentTheme}
              themeClasses={themeClasses}
            />

            {meetings.length > 0 && (
              <MeetingSummary meetings={meetings} theme={currentTheme} themeClasses={themeClasses} />
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className={currentTheme === "dark" ? "bg-gray-800 border-gray-700" : ""}>
                <TabsTrigger value="gantt" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Gantt Chart
                </TabsTrigger>
                <TabsTrigger value="list" className="flex items-center gap-2">
                  <List className="h-4 w-4" />
                  Task Management
                </TabsTrigger>
                <TabsTrigger value="meetings" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Meetings ({meetings.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="gantt" className="space-y-4">
                <Card className={themeClasses.card}>
                  <CardHeader className={themeClasses.header}>
                    <CardTitle>Project Timeline</CardTitle>
                    <CardDescription className={currentTheme === "dark" ? "text-gray-300" : ""}>
                      Visual representation of project tasks and their timelines
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {tasks.map((task) => {
                        const position = getTaskPosition(task)
                        return (
                          <div key={task.id} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{task.name}</span>
                                <Badge variant="outline" className={getStatusColor(task.status)}>
                                  {task.status}
                                </Badge>
                                {task.proposedChanges && (
                                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                                    Pending Changes
                                  </Badge>
                                )}
                              </div>
                              <div className="text-muted-foreground">
                                {formatDate(task.startDate)} - {formatDate(task.endDate)}
                              </div>
                            </div>
                            <div
                              className={`relative h-8 rounded ${currentTheme === "dark" ? "bg-gray-700" : "bg-gray-100"}`}
                            >
                              <div
                                className={`absolute h-full rounded flex items-center justify-center text-white text-xs font-medium ${
                                  currentTheme === "modern"
                                    ? "bg-gradient-to-r from-blue-500 to-purple-500"
                                    : currentTheme === "dark"
                                      ? "bg-blue-600"
                                      : "bg-primary"
                                }`}
                                style={position}
                              >
                                {task.progress > 0 && `${task.progress}%`}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="list" className="space-y-4">
                <TaskManager
                  tasks={tasks}
                  onTaskUpdate={handleTaskUpdate}
                  getPriorityColor={getPriorityColor}
                  getStatusColor={getStatusColor}
                  formatDate={formatDate}
                  theme={currentTheme}
                  themeClasses={themeClasses}
                />
              </TabsContent>

              <TabsContent value="meetings" className="space-y-4">
                <Card className={themeClasses.card}>
                  <CardHeader className={themeClasses.header}>
                    <CardTitle>Meeting History</CardTitle>
                    <CardDescription className={currentTheme === "dark" ? "text-gray-300" : ""}>
                      All recorded meetings and their summaries
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {meetings.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Mic className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No meetings recorded yet. Start by recording a meeting in the Meeting Recorder section.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {meetings.map((meeting) => (
                          <div
                            key={meeting.id}
                            className={`border rounded-lg p-4 ${currentTheme === "dark" ? "border-gray-700" : ""}`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold">{meeting.title}</h3>
                              <span className="text-sm text-muted-foreground">
                                {formatDate(meeting.date)} • {Math.round(meeting.duration / 60)}min
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{meeting.summary}</p>
                            <div className="text-xs text-muted-foreground">
                              {meeting.taskProposals.length} task updates proposed
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}

        {tasks.length === 0 && (
          <Card className={themeClasses.card}>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileSpreadsheet className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Project Data</h3>
              <p className="text-muted-foreground text-center mb-4">
                Upload an Excel file or load sample data to get started with your project management dashboard.
              </p>
              <Button onClick={loadSampleData}>Load Sample Data</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
