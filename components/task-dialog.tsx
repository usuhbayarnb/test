"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import type { Task, TaskStatus, TaskPriority } from "@/lib/types"
import { useTaskStore } from "@/lib/task-store"
import { useAuth } from "@/lib/auth-context"
import { format } from "date-fns"
import { Calendar, User, Clock } from "lucide-react"

interface TaskDialogProps {
  task: Task | null
  open: boolean
  onOpenChange: (open: boolean) => void
  employees?: { id: string; name: string }[]
  showAssignment?: boolean
  showStatusChange?: boolean
}

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "in_review", label: "In Review" },
  { value: "completed", label: "Completed" },
]

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
]

export function TaskDialog({
  task,
  open,
  onOpenChange,
  employees = [],
  showAssignment = false,
  showStatusChange = false,
}: TaskDialogProps) {
  const { updateTask, getTaskHistory } = useTaskStore()
  const { user } = useAuth()
  const [selectedEmployee, setSelectedEmployee] = useState<string>("")
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus>("pending")
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority>("medium")

  useEffect(() => {
    if (task) {
      setSelectedEmployee(task.assignedToId || "")
      setSelectedStatus(task.status)
      setSelectedPriority(task.priority)
    }
  }, [task])

  if (!task || !user) return null

  const taskHistory = getTaskHistory(task.id)

  const handleAssign = () => {
    if (selectedEmployee) {
      const employee = employees.find((e) => e.id === selectedEmployee)
      updateTask(
        task.id,
        {
          assignedToId: selectedEmployee,
          assignedToName: employee?.name || "",
        },
        user.id,
        user.name,
      )
    }
  }

  const handleStatusChange = () => {
    updateTask(
      task.id,
      {
        status: selectedStatus,
      },
      user.id,
      user.name,
    )
  }

  const handlePriorityChange = () => {
    updateTask(
      task.id,
      {
        priority: selectedPriority,
      },
      user.id,
      user.name,
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{task.title}</DialogTitle>
          <DialogDescription>Даалгаврын ID: {task.id}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label className="text-base font-semibold">Тайлбар</Label>
            <p className="mt-2 text-sm text-muted-foreground">{task.description}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Хэрэглэгч
              </Label>
              <p className="text-sm">{task.clientName}</p>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Хуваарилагдсан
              </Label>
              <p className="text-sm">{task.assignedToName || "Хуваарилаагүй"}</p>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Дуусах огноо
              </Label>
              <p className="text-sm">{task.dueDate ? format(new Date(task.dueDate), "MMMM d, yyyy") : "No due date"}</p>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Үүсгэсэн
              </Label>
              <p className="text-sm">{format(new Date(task.createdAt), "MMM d, yyyy")}</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div>
              <Label>Статус</Label>
              <div className="mt-2">
                <Badge className="capitalize">{task.status.replace("_", " ")}</Badge>
              </div>
            </div>
            <div>
              <Label>Тэргүүлэх байдал</Label>
              <div className="mt-2">
                <Badge variant="outline" className="capitalize">
                  {task.priority}
                </Badge>
              </div>
            </div>
          </div>

          {showAssignment && employees.length > 0 && (
            <div className="space-y-3 rounded-lg border p-4">
              <Label>Даалгавар хуваарилах</Label>
              <div className="flex gap-2">
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleAssign} disabled={!selectedEmployee || selectedEmployee === task.assignedToId}>
                  Хуваарилах
                </Button>
              </div>
            </div>
          )}

          {showStatusChange && (
            <div className="space-y-3 rounded-lg border p-4">
              <Label>Статус шинэчлэх</Label>
              <div className="flex gap-2">
                <Select value={selectedStatus} onValueChange={(v) => setSelectedStatus(v as TaskStatus)}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleStatusChange} disabled={selectedStatus === task.status}>
                  Шинэчлэх
                </Button>
              </div>
            </div>
          )}

          {user.role === "manager" && (
            <div className="space-y-3 rounded-lg border p-4">
              <Label>Тэргүүлэх байдал</Label>
              <div className="flex gap-2">
                <Select value={selectedPriority} onValueChange={(v) => setSelectedPriority(v as TaskPriority)}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handlePriorityChange} disabled={selectedPriority === task.priority}>
                  Шинэчлэх
                </Button>
              </div>
            </div>
          )}

          {taskHistory.length > 0 && (
            <div className="space-y-3">
              <Label className="text-base font-semibold">Түүх</Label>
              <div className="space-y-2 rounded-lg border p-4">
                {taskHistory.map((entry) => (
                  <div key={entry.id} className="flex justify-between border-b pb-2 text-sm last:border-0">
                    <div>
                      <p className="font-medium">{entry.details}</p>
                      <p className="text-xs text-muted-foreground">by {entry.userName}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(entry.createdAt), "MMM d, h:mm a")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
