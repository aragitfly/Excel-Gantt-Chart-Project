"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, Clock, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react"
import type { Meeting } from "../app/page"

type DesignTheme = "light" | "dark" | "modern"

interface MeetingSummaryProps {
  meetings: Meeting[]
  theme: DesignTheme
  themeClasses: any
}

export function MeetingSummary({ meetings, theme, themeClasses }: MeetingSummaryProps) {
  const latestMeeting = meetings[meetings.length - 1]

  const getOverallStatus = () => {
    const totalProposals = latestMeeting.taskProposals.length
    const delayedTasks = latestMeeting.taskProposals.filter(
      (p) => p.proposedStatus === "Delayed" || p.proposedStatus === "Blocked",
    ).length

    if (delayedTasks === 0) return { status: "On Track", icon: CheckCircle, color: "text-green-600" }
    if (delayedTasks < totalProposals / 2)
      return { status: "Minor Issues", icon: AlertTriangle, color: "text-yellow-600" }
    return { status: "At Risk", icon: TrendingDown, color: "text-red-600" }
  }

  const overallStatus = getOverallStatus()

  return (
    <Card className={themeClasses.card}>
      <CardHeader className={themeClasses.header}>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Latest Meeting Summary
        </CardTitle>
        <CardDescription>AI-generated insights from your most recent project meeting</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {latestMeeting && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{latestMeeting.title}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {latestMeeting.date.toLocaleDateString()} • {Math.round(latestMeeting.duration / 60)} minutes
                </div>
              </div>
              <div className="flex items-center gap-2">
                <overallStatus.icon className={`h-5 w-5 ${overallStatus.color}`} />
                <Badge variant="outline" className={overallStatus.color}>
                  {overallStatus.status}
                </Badge>
              </div>
            </div>

            <div
              className={`rounded-lg p-4 ${
                theme === "dark"
                  ? "bg-gray-800"
                  : theme === "modern"
                    ? "bg-gradient-to-r from-gray-50 to-slate-50"
                    : "bg-gray-50"
              }`}
            >
              <h4 className="font-medium mb-2">Executive Summary</h4>
              <p className="text-sm text-muted-foreground">{latestMeeting.summary}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                className={`text-center p-3 rounded-lg ${
                  theme === "modern"
                    ? "bg-gradient-to-r from-blue-50 to-cyan-50"
                    : theme === "dark"
                      ? "bg-blue-900/20"
                      : "bg-blue-50"
                }`}
              >
                <div className="text-2xl font-bold text-blue-600">{latestMeeting.taskProposals.length}</div>
                <div className="text-sm text-blue-800">Tasks Discussed</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {latestMeeting.taskProposals.filter((p) => p.proposedStatus === "Delayed").length}
                </div>
                <div className="text-sm text-yellow-800">Delays Identified</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {latestMeeting.taskProposals.filter((p) => p.proposedStatus === "Blocked").length}
                </div>
                <div className="text-sm text-red-800">Blockers Found</div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Key Issues & Actions</h4>
              {latestMeeting.taskProposals.map((proposal) => (
                <div key={proposal.id} className="flex items-center gap-2 text-sm p-2 bg-gray-50 rounded">
                  {proposal.proposedStatus === "Delayed" && <TrendingDown className="h-4 w-4 text-yellow-600" />}
                  {proposal.proposedStatus === "Blocked" && <AlertTriangle className="h-4 w-4 text-red-600" />}
                  {proposal.proposedProgress && <TrendingUp className="h-4 w-4 text-green-600" />}
                  <span className="flex-1">{proposal.reason}</span>
                  <Badge variant="outline" className="text-xs">
                    {Math.round(proposal.confidence * 100)}% confidence
                  </Badge>
                </div>
              ))}
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full bg-transparent">
                  View Full Transcript
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{latestMeeting.title} - Full Transcript</DialogTitle>
                  <DialogDescription>Complete meeting transcript with AI analysis</DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-96 w-full">
                  <div className="p-4 text-sm">{latestMeeting.transcript}</div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </>
        )}
      </CardContent>
    </Card>
  )
}
