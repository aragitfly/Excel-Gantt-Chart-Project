"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Mic, Play, Pause, Square, Clock, Users } from "lucide-react"
import type { Task, Meeting, TaskProposal } from "../app/page"

type DesignTheme = "default" | "dark" | "modern"

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
  const [isProcessing, setIsProcessing] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)

      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      console.error("Error starting recording:", error)
      alert("Could not access microphone. Please check permissions.")
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume()
        timerRef.current = setInterval(() => {
          setRecordingTime((prev) => prev + 1)
        }, 1000)
      } else {
        mediaRecorderRef.current.pause()
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }
      }
      setIsPaused(!isPaused)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)

      if (timerRef.current) {
        clearInterval(timerRef.current)
      }

      // Process the recording
      setTimeout(() => {
        processRecording()
      }, 100)
    }
  }

  const processRecording = async () => {
    if (audioChunksRef.current.length === 0) return

    setIsProcessing(true)

    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })

      // Simulate transcription and AI analysis
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const mockTranscript = `Meeting discussion about project progress. John mentioned that the design phase is experiencing delays due to waiting for client feedback on the mockups. The requirements gathering is 80% complete with Jane leading the stakeholder interviews. Mike reported that the design work is progressing but slower than expected. We discussed moving the end date for the design phase by one week. The development phase timeline may need adjustment based on design completion.`

      const mockSummary = `Project Status Update: Requirements gathering is on track at 80% completion. Design phase is experiencing delays due to client feedback dependency. Proposed timeline adjustment needed for design phase completion.`

      // Generate task proposals based on transcript analysis
      const taskProposals: TaskProposal[] = [
        {
          id: `proposal-${Date.now()}-1`,
          taskId: "3", // Design Phase
          proposedStatus: "Delayed",
          proposedEndDate: new Date("2024-02-17"), // Extended by 1 week
          reason: "Waiting for client feedback on mockups",
          confidence: 0.85,
          meetingId: `meeting-${Date.now()}`,
          timestamp: new Date(),
        },
        {
          id: `proposal-${Date.now()}-2`,
          taskId: "2", // Requirements Gathering
          proposedProgress: 85,
          reason: "Progress update from stakeholder interviews",
          confidence: 0.9,
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
        summary: mockSummary,
        taskProposals,
        audioBlob,
      }

      onMeetingComplete(meeting)

      // Reset form
      setMeetingTitle("")
      setRecordingTime(0)
    } catch (error) {
      console.error("Error processing recording:", error)
    } finally {
      setIsProcessing(false)
    }
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
        <CardDescription>
          Record project meetings to automatically track progress, identify delays, and update task status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="meeting-title">Meeting Title</Label>
            <Input
              id="meeting-title"
              placeholder="e.g., Weekly Project Standup"
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
              disabled={isRecording}
            />
          </div>

          <div className="space-y-2">
            <Label>Recording Status</Label>
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${isRecording ? (isPaused ? "bg-yellow-500" : "bg-red-500 animate-pulse") : "bg-gray-300"}`}
              />
              <span className="text-sm font-medium">{isRecording ? (isPaused ? "Paused" : "Recording") : "Ready"}</span>
              {isRecording && (
                <Badge variant="outline" className="ml-2">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatTime(recordingTime)}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isRecording ? (
            <Button onClick={startRecording} disabled={isProcessing}>
              <Mic className="h-4 w-4 mr-2" />
              Start Recording
            </Button>
          ) : (
            <>
              <Button onClick={pauseRecording} variant="outline">
                {isPaused ? <Play className="h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
                {isPaused ? "Resume" : "Pause"}
              </Button>
              <Button onClick={stopRecording} variant="destructive">
                <Square className="h-4 w-4 mr-2" />
                Stop & Process
              </Button>
            </>
          )}
        </div>

        {isProcessing && (
          <div
            className={`border rounded-lg p-4 ${
              theme === "dark"
                ? "bg-blue-900/20 border-blue-700"
                : theme === "modern"
                  ? "bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200"
                  : "bg-blue-50 border-blue-200"
            }`}
          >
            <div className="flex items-center gap-2 text-blue-800">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-800"></div>
              <span className="font-medium">Processing recording...</span>
            </div>
            <p className="text-sm text-blue-600 mt-1">Transcribing audio and analyzing for task updates</p>
          </div>
        )}

        <div
          className={`rounded-lg p-4 ${
            theme === "dark"
              ? "bg-gray-800"
              : theme === "modern"
                ? "bg-gradient-to-r from-gray-50 to-slate-50"
                : "bg-gray-50"
          }`}
        >
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Active Tasks ({tasks.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {tasks.slice(0, 4).map((task) => (
              <div key={task.id} className="text-sm bg-white rounded p-2">
                <span className="font-medium">{task.name}</span>
                <div className="text-muted-foreground">
                  {task.assignee} • {task.status}
                </div>
              </div>
            ))}
            {tasks.length > 4 && (
              <div className="text-sm text-muted-foreground p-2">+{tasks.length - 4} more tasks</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
