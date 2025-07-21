"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Mic, Square, Play, Pause } from "lucide-react"
import type { Task, Meeting, TaskProposal, DesignTheme } from "../app/page"

interface MeetingRecorderProps {
  tasks: Task[]
  onMeetingComplete: (meeting: Meeting) => void
  theme: DesignTheme
  themeClasses: any
}

export function MeetingRecorder({ tasks, onMeetingComplete, theme, themeClasses }: MeetingRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [meetingTitle, setMeetingTitle] = useState("")

  // Simulated recording functionality
  const startRecording = () => {
    setIsRecording(true)
    setIsPaused(false)
    // Simulate timer
    const interval = setInterval(() => {
      setRecordingTime((prev) => prev + 1)
    }, 1000)

    // Store interval ID for cleanup
    ;(window as any).recordingInterval = interval
  }

  const pauseRecording = () => {
    setIsPaused(!isPaused)
  }

  const stopRecording = () => {
    setIsRecording(false)
    setIsPaused(false)
    clearInterval((window as any).recordingInterval)

    // Simulate AI processing and generate meeting summary
    const mockTranscript = `Meeting discussion about project progress. John mentioned that the project planning phase is nearly complete with scope definition finished. Jane reported that the project charter is 90% done and should be ready by end of week. Mike noted some delays in stakeholder analysis due to scheduling conflicts with key stakeholders. The team discussed that requirements gathering is progressing well with functional requirements at 80% completion. There are some concerns about the design phase timeline due to dependencies on requirements completion.`

    const mockTaskProposals: TaskProposal[] = [
      {
        id: "proposal-1",
        taskId: "1.2",
        proposedStatus: "Completed",
        proposedProgress: 100,
        reason: "Charter development mentioned as nearly complete in meeting",
        confidence: 0.85,
        meetingId: `meeting-${Date.now()}`,
        timestamp: new Date(),
      },
      {
        id: "proposal-2",
        taskId: "1.3",
        proposedStatus: "Delayed",
        proposedProgress: 40,
        proposedEndDate: new Date("2024-01-25"),
        reason: "Stakeholder scheduling conflicts mentioned causing delays",
        confidence: 0.92,
        meetingId: `meeting-${Date.now()}`,
        timestamp: new Date(),
      },
    ]

    const meeting: Meeting = {
      id: `meeting-${Date.now()}`,
      title: meetingTitle || `Project Meeting - ${new Date().toLocaleDateString()}`,
      date: new Date(),
      duration: recordingTime,
      transcript: mockTranscript,
      summary:
        "Project planning phase nearing completion. Charter development at 90%. Stakeholder analysis experiencing delays due to scheduling conflicts. Requirements gathering progressing well with functional requirements at 80%.",
      taskProposals: mockTaskProposals,
    }

    onMeetingComplete(meeting)
    setRecordingTime(0)
    setMeetingTitle("")
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Card className={themeClasses.card}>
      <CardHeader className={themeClasses.header}>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5" />
          Meeting Recorder
        </CardTitle>
        <CardDescription className={theme === "dark" ? "text-gray-300" : ""}>
          Record project meetings and get AI-powered task status analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="meeting-title">Meeting Title</Label>
          <Input
            id="meeting-title"
            placeholder="Enter meeting title..."
            value={meetingTitle}
            onChange={(e) => setMeetingTitle(e.target.value)}
            disabled={isRecording}
          />
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-4">
            <div
              className={`w-3 h-3 rounded-full ${isRecording && !isPaused ? "bg-red-500 animate-pulse" : "bg-gray-300"}`}
            />
            <span className="font-mono text-lg">{formatTime(recordingTime)}</span>
            {isRecording && (
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                {isPaused ? "Paused" : "Recording"}
              </Badge>
            )}
          </div>

          <div className="flex gap-2">
            {!isRecording ? (
              <Button onClick={startRecording} disabled={!meetingTitle.trim()}>
                <Mic className="h-4 w-4 mr-2" />
                Start Recording
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={pauseRecording}>
                  {isPaused ? <Play className="h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
                  {isPaused ? "Resume" : "Pause"}
                </Button>
                <Button variant="destructive" onClick={stopRecording}>
                  <Square className="h-4 w-4 mr-2" />
                  Stop & Analyze
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>
            <strong>How it works:</strong> Record your project meetings and our AI will automatically analyze the
            discussion to identify task status updates, delays, and blockers. Proposed changes will appear in the Task
            Management section for your review.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
