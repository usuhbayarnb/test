"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Task } from "@/lib/types"
import { Calendar, User } from "lucide-react"
import { format } from "date-fns"

interface TaskCardProps {
  task: Task
  onClick?: () => void
}

const STATUS_COLORS = {
  pending: "bg-gray-500",
  in_progress: "bg-blue-500",
  in_review: "bg-orange-500",
  completed: "bg-green-500",
}

const STATUS_LABELS = {
  pending: "Pending",
  in_progress: "In Progress",
  in_review: "In Review",
  completed: "Completed",
}

const PRIORITY_COLORS = {
  low: "border-gray-300",
  medium: "border-blue-400",
  high: "border-orange-400",
  urgent: "border-red-500",
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  return (
    <Card
      className={`cursor-pointer border-l-4 transition-shadow hover:shadow-md ${PRIORITY_COLORS[task.priority]}`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg leading-tight">{task.title}</CardTitle>
          <Badge className={`${STATUS_COLORS[task.status]} text-white`}>{STATUS_LABELS[task.status]}</Badge>
        </div>
        <CardDescription className="line-clamp-2">{task.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <User className="h-4 w-4" />
          <span>{task.assignedToName ? `Assigned to ${task.assignedToName}` : "Unassigned"}</span>
        </div>
        {task.dueDate && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Due {format(new Date(task.dueDate), "MMM d, yyyy")}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs capitalize">
            {task.priority}
          </Badge>
          <span className="text-xs text-muted-foreground">Client: {task.clientName}</span>
        </div>
      </CardContent>
    </Card>
  )
}
